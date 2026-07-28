import { useState } from 'react'

export const useRiegoGps = () => {
  const [capturing, setCapturing] = useState(false)

  const capture = (): Promise<{ lat: string; lng: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizacao indisponivel neste dispositivo'))
        return
      }

      setCapturing(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCapturing(false)
          resolve({
            lat: String(position.coords.latitude),
            lng: String(position.coords.longitude),
          })
        },
        (error) => {
          setCapturing(false)
          reject(new Error(error.message))
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
        }
      )
    })
  }

  return {
    capturing,
    capture,
  }
}
