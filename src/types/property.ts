export type Status = 'green' | 'yellow' | 'red'

export interface Property {
  id: number
  code: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  total_units: number
  occupied_units: number
  vacant_units: number
  notice_units: number
  status: Status
  lat: number | null
  lng: number | null
}

export interface PropertiesData {
  synced_at: string
  properties: Property[]
}
