const axios = require('axios').create({
  baseURL: 'https://api.llama.fi',
  timeout: 180000 * 3
})

exports.getCharts = (chain) => {
  const url = chain
    ? `/charts/${chain}`
    : '/charts'

  console.log('Fetching TVL history', chain)

  return axios.get(url)
    .then(resp => resp.data)
    .catch(e => {
      console.error(e)
      return []
    })
}

exports.getProtocols = () => {
  console.log('Fetching DeFi protocols')

  return axios.get('/protocols').then(({ data = [] }) => {
    return data.filter(item => item.slug !== 'polygon-bridge-&-staking')
  })
}

exports.getProtocol = id => {
  console.log(`Fetching defi protocol info ${id}`)

  return axios.get(`/protocol/${id}`)
    .then(resp => resp.data)
}
