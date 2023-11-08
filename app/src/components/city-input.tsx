'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import AutoComplete, { Option } from '@/components/autocomplete'
import { GeoLocation } from '@/types'

export const CityInput = () => {
  const router = useRouter()
  const pathname = usePathname()

  const [inputValue, setInputValue] = useState('')
  const valueDebounced = useDebounce(inputValue, 500)

  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!valueDebounced || valueDebounced.length < 4) {
      setOptions([])
      return
    }
    const fetchSuggestions = async () => {
      setLoading(true)
      const suggestions = await fetch('/api/geolocation?q=' + valueDebounced)
      const json = await suggestions.json()
      setOptions(
        json.data.map((suggestion: GeoLocation) => ({
          value: `${suggestion.coordinates.latitude},${suggestion.coordinates.longitude}`,
          label: `${suggestion.city}, ${suggestion.countryCode}`,
        })),
      )
      setLoading(false)
    }
    fetchSuggestions()
  }, [valueDebounced])

  const submit = (value: Option) => {
    const [lat, lon] = value.value.split(',')
    const newParams = new URLSearchParams({
      lat,
      lon,
    })
    router.push(`${pathname}?${newParams}`)
  }

  return (
    <>
      <AutoComplete
        placeholder="City Name"
        onValueChange={submit}
        onInputChange={setInputValue}
        options={options}
        isLoading={loading}
      />
      <Button className="w-full bg-[#375BD2] py-3 text-xl font-medium leading-[26px] hover:bg-[#375BD2]/90">
        Run
        <Image src="/arrow-right.svg" width={36} height={36} alt="arrow" />
      </Button>
    </>
  )
}
