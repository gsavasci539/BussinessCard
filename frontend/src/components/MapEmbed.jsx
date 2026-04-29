export default function MapEmbed({ address, latitude, longitude }){
  if(latitude && longitude){
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01}%2C${latitude-0.01}%2C${longitude+0.01}%2C${latitude+0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
    return (
      <iframe title="map" className="w-full h-64 rounded-md border" src={src}></iframe>
    )
  }
  if(address){
    const q = encodeURIComponent(address)
    const src = `https://www.google.com/maps?q=${q}&output=embed`
    return (
      <iframe title="map" className="w-full h-64 rounded-md border" src={src}></iframe>
    )
  }
  return null
}
