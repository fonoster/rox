export interface Intent {
  action: string
  effectId: string
  confidence: number
  allRequiredParamsPresent: boolean
}

export interface Intents {
  findIntent: (text:string) => Promise<Intent | null>
}