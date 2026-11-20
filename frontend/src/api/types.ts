export interface ErrorRecord {
  id: string
  title: string
  errorMessage: string
  stackTrace: string | null
  source: string | null
  environment: string | null
  rootCause: string | null
  resolution: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ErrorRecordInput {
  title: string
  errorMessage: string
  stackTrace?: string | null
  source?: string | null
  environment?: string | null
  rootCause?: string | null
  resolution?: string | null
  tags?: string[]
}
