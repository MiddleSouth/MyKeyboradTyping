/// <reference path="../xz-decompress.d.ts" />

import type { HIDDevice, HIDInputReportEvent } from '../types/webhid'
import { createLogger } from '../composables/useLogger'
import { VIAL_COMMAND, VIAL_PREFIX, VIA_REPORT_SIZE } from '../constants/via'
import { XzReadableStream } from 'xz-decompress'

const logger = createLogger('VialDefinitionLoader')

export type VialDefinitionResult = {
  source: 'vial'
  raw?: Uint8Array
  json?: any
  layouts?: any
} | null

function createResponsePromise(device: HIDDevice, key: string): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`レスポンスタイムアウト: ${key}`))
    }, 5000)

    const listener = (event: HIDInputReportEvent) => {
      const data = event.data
      const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)

      logger.debug(`レスポンス受信 (${key}):`, {
        reportId: event.reportId,
        bytes: Array.from(buffer.slice(0, 16)),
      })

      clearTimeout(timeout)
      device.removeEventListener('inputreport', listener)
      resolve(buffer)
    }

    device.addEventListener('inputreport', listener)
  })
}

async function trySendReport(
  device: HIDDevice,
  reportId: number,
  dataBuffer: BufferSource
): Promise<{ success: boolean; error?: Error }> {
  try {
    await device.sendReport(reportId, dataBuffer)
    logger.debug('Vialコマンド送信成功（sendReport）')
    return { success: true }
  } catch (error) {
    logger.warn('Vialコマンド送信失敗（sendReport）', error)
    return { success: false, error: error as Error }
  }
}

async function trySendFeatureReport(
  device: HIDDevice,
  reportId: number,
  dataBuffer: BufferSource
): Promise<{ success: boolean }> {
  try {
    await device.sendFeatureReport(reportId, dataBuffer)
    logger.debug('Vialコマンド送信成功（sendFeatureReport）')
    return { success: true }
  } catch (error) {
    logger.warn('Vialコマンド送信失敗（sendFeatureReport）', error)
    throw new Error('Vialコマンド送信に失敗しました', { cause: error })
  }
}

async function sendVialCommand(
  device: HIDDevice,
  command: number[],
  reportId: number
): Promise<void> {
  const dataBuffer = new Uint8Array(VIA_REPORT_SIZE)

  for (let i = 0; i < command.length && i < VIA_REPORT_SIZE; i++) {
    dataBuffer[i] = command[i]
  }

  logger.debug('Vial コマンド送信:', {
    reportId,
    command,
    fullBuffer: Array.from(dataBuffer.slice(0, Math.min(16, dataBuffer.length))),
  })

  const result = await trySendReport(device, reportId, dataBuffer)
  if (result.success) {
    return
  }

  await trySendFeatureReport(device, reportId, dataBuffer)
}

async function decompressLzma(raw: Uint8Array): Promise<Uint8Array> {
  const compressedBytes = new Uint8Array(raw.byteLength)
  compressedBytes.set(raw)
  const compressedStream = new Blob([compressedBytes.buffer]).stream()
  const decompressedStream = new XzReadableStream(compressedStream)
  const arrayBuffer = await new Response(decompressedStream).arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

function parsePayload(jsonText: string): any {
  return JSON.parse(jsonText.replace(/^\uFEFF/, ''))
}

export async function fetchVialDefinition(
  device: HIDDevice,
  reportId: number
): Promise<VialDefinitionResult> {
  try {
    logger.debug('Vial定義取得を試行します')

    const keyboardIdPromise = createResponsePromise(device, 'vial-keyboard-id')
    await sendVialCommand(device, [VIAL_PREFIX, VIAL_COMMAND.GET_KEYBOARD_ID], reportId)
    const keyboardIdBuffer = await keyboardIdPromise
    logger.debug('Vial keyboard id response:', {
      bytes: Array.from(keyboardIdBuffer.slice(0, 16)),
    })

    const sizePromise = createResponsePromise(device, 'vial-definition-size')
    await sendVialCommand(device, [VIAL_PREFIX, VIAL_COMMAND.GET_SIZE], reportId)
    const sizeBuffer = await sizePromise
    const size = new DataView(sizeBuffer.buffer, sizeBuffer.byteOffset, sizeBuffer.byteLength).getUint32(0, true)
    logger.debug('Vial定義サイズ:', { size })

    const rawChunks: number[] = []
    const totalBlocks = Math.ceil(size / VIA_REPORT_SIZE)

    for (let block = 0; block < totalBlocks; block++) {
      const blockPromise = createResponsePromise(device, `vial-definition-block-${block}`)
      const blockBytes = [
        VIAL_PREFIX,
        VIAL_COMMAND.GET_DEFINITION,
        block & 0xff,
        (block >> 8) & 0xff,
        (block >> 16) & 0xff,
        (block >> 24) & 0xff,
      ]

      await sendVialCommand(device, blockBytes, reportId)
      const blockBuffer = await blockPromise

      logger.debug('Vial定義ブロック受信:', {
        block,
        bytes: Array.from(blockBuffer.slice(0, 16)),
      })

      rawChunks.push(...Array.from(blockBuffer))
    }

    const raw = Uint8Array.from(rawChunks).slice(0, size)
    logger.debug('Vial定義 raw bytes 取得完了:', {
      rawLength: raw.length,
      preview: Array.from(raw.slice(0, 32)),
    })

    const candidates = [raw, raw.slice(1), raw.slice(2), raw.slice(4)]
    let json: any = null

    for (const candidate of candidates) {
      if (candidate.length === 0) {
        continue
      }

      try {
        const decompressed = await decompressLzma(candidate)
        const text = new TextDecoder().decode(decompressed)
        json = parsePayload(text)
        logger.debug('Vial定義 JSON 復元成功:', {
          candidateLength: candidate.length,
          textPreview: text.slice(0, 120),
          hasLayouts: !!json?.layouts,
          hasKeymap: !!json?.layouts?.keymap,
        })
        break
      } catch (error) {
        logger.warn('Vial定義の復元候補で失敗しました', {
          candidateLength: candidate.length,
          error,
        })
      }
    }

    if (!json) {
      logger.warn('Vial定義JSONの復元に失敗しました。静的JSONへフォールバックします。')
      return null
    }

    return {
      source: 'vial',
      raw,
      json,
      layouts: json.layouts,
    }
  } catch (error) {
    logger.warn('Vial定義取得に失敗しました。静的JSONへフォールバックします。', error)
    return null
  }
}