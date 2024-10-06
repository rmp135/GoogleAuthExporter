import protobuf from 'protobufjs'
import proto from './google_auth.proto?raw'

export function decode(payload: string) : MigrationPayload | null {
  try {
    const root = protobuf.parse(proto).root
    
    const MigrationPayload = root.lookupType('googleauth.MigrationPayload')
    
    const bufferPayload = Uint8Array.from(payload, c => c.charCodeAt(0))
    
    const message = MigrationPayload.decode(bufferPayload)
    
    return MigrationPayload.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    }) as MigrationPayload
  }
  catch (e) {
    return null
  }
}


export interface OtpParameter {
  secret: string
  name: string
  issuer: string
  algorithm: number
  digits: number
  type: number
  counter: number
  uniqueId: string
}

export interface MigrationPayload {
  otpParameters: OtpParameter[]
  version: number
  batchSize: number
  batchIndex: number
  batchId: number
}
 