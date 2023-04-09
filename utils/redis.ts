import Redis from 'ioredis'

let redis = new Redis('redis://localhost:1234')
export default redis;