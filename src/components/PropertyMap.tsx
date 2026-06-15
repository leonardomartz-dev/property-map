'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property, PropertiesData } from '../types/property'

const STATUS_COLOR = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }
const STATUS_LABEL = { green: 'Vacancy', yellow: 'Notice', red: 'Full' }

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap()
  useEffect(() => {
    const valid = properties.filter(p => p.lat !== null && p.lng !== null)
    if (valid.length < 2) return
    const lats = valid.map(p => p.lat as number)
    const lngs = valid.map(p => p.lng as number)
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [48, 48] }
    )
  }, [map, properties])
  return null
}

function StatusBadge({ status, count }: { status: 'green' | 'yellow' | 'red'; count: number }) {
  const classes = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${classes[status]}`}>
      {STATUS_LABEL[status]} {count > 0 && `(${count})`}
    </span>
  )
}

export default function PropertyMap() {
  const [data, setData] = useState<PropertiesData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`/data/properties.json?t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400 text-sm">
      Error: {error}
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400 text-sm">
      Loading map...
    </div>
  )

  const valid = data.properties.filter(p => p.lat !== null && p.lng !== null)
  const missing = data.properties.length - valid.length
  const counts = { green: 0, yellow: 0, red: 0 }
  data.properties.forEach(p => counts[p.status]++)

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm tracking-wide">Property Map</span>
          <span className="text-gray-500 text-xs hidden sm:inline">Template demo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {(['green', 'yellow', 'red'] as const).map(s => (
              <span key={s} className="flex items-center gap-1 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: STATUS_COLOR[s] }} />
                {STATUS_LABEL[s]} <span className="text-gray-500">({counts[s]})</span>
              </span>
            ))}
          </div>
          <span className="text-gray-500 text-xs hidden md:inline">
            Synced {new Date(data.synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 px-2.5 py-1 rounded transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        style={{ width: '100%', height: '100%', paddingTop: '44px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={valid} />
        {valid.map(p => (
          <CircleMarker
            key={p.id}
            center={[p.lat as number, p.lng as number]}
            radius={p.total_units > 50 ? 14 : p.total_units > 10 ? 11 : 8}
            pathOptions={{
              fillColor: STATUS_COLOR[p.status],
              fillOpacity: 0.88,
              color: '#1f2937',
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold text-gray-900 mb-0.5">{p.code.toUpperCase()}</div>
                <div className="text-gray-500 text-xs mb-2">{p.address}, {p.city}, {p.state} {p.zip}</div>
                <div className="mb-2">
                  <StatusBadge status={p.status} count={p.status === 'green' ? p.vacant_units : p.notice_units} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
                  <span className="text-gray-400">Total units</span><span className="font-medium">{p.total_units}</span>
                  <span className="text-gray-400">Occupied</span><span className="font-medium">{p.occupied_units}</span>
                  {p.vacant_units > 0 && (
                    <><span className="text-green-600">Vacant now</span><span className="font-medium text-green-700">{p.vacant_units}</span></>
                  )}
                  {p.notice_units > 0 && (
                    <><span className="text-yellow-600">Notice given</span><span className="font-medium text-yellow-700">{p.notice_units}</span></>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Missing geocodes warning */}
      {missing > 0 && (
        <div className="absolute bottom-4 left-4 z-[1001] bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded shadow">
          {missing} {missing === 1 ? 'property' : 'properties'} could not be geocoded and are not shown.
        </div>
      )}
    </div>
  )
}
