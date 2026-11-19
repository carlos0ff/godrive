export function caminhoPublico(url: string): string {
  return url.startsWith('/') && !url.startsWith('//') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url
}
