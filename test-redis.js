/**
 * Redis Connection Test Script
 *
 * This script tests your Redis connection and demonstrates basic operations
 *
 * Run: node test-redis.js
 */

const Redis = require('ioredis');

console.log('🔍 Testing Redis Connection...\n');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Could not connect to Redis after 3 attempts');
      return null;
    }
    return Math.min(times * 100, 3000);
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connection established!\n');
  runTests();
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Is Redis running? Check: docker ps');
  console.log('   2. Start Redis: docker-compose -f docker-compose.dev.yml up -d redis');
  console.log('   3. Check logs: docker-compose -f docker-compose.dev.yml logs redis\n');
  process.exit(1);
});

async function runTests() {
  try {
    console.log('📝 Running Redis Tests...\n');

    // Test 1: Basic String Operations
    console.log('Test 1: String Operations');
    await redis.set('test:string', 'Hello from Redis!');
    const value = await redis.get('test:string');
    console.log(`   ✓ SET/GET: "${value}"`);

    // Test 2: Expiring Keys (TTL)
    console.log('\nTest 2: Expiring Keys (TTL)');
    await redis.setex('test:expiring', 10, 'This expires in 10 seconds');
    const ttl = await redis.ttl('test:expiring');
    console.log(`   ✓ Key expires in: ${ttl} seconds`);

    // Test 3: Hash Operations (like objects)
    console.log('\nTest 3: Hash Operations');
    await redis.hset('test:user:123', {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'visitor'
    });
    const user = await redis.hgetall('test:user:123');
    console.log('   ✓ Stored user object:', user);

    // Test 4: Lists (for queues)
    console.log('\nTest 4: List Operations (Queue)');
    await redis.lpush('test:queue', 'task1', 'task2', 'task3');
    const queueLength = await redis.llen('test:queue');
    const firstTask = await redis.rpop('test:queue');
    console.log(`   ✓ Queue length: ${queueLength}`);
    console.log(`   ✓ Popped task: "${firstTask}"`);

    // Test 5: Sets (for unique items)
    console.log('\nTest 5: Set Operations');
    await redis.sadd('test:tags', 'morning', 'work', 'important', 'morning');
    const tags = await redis.smembers('test:tags');
    console.log(`   ✓ Unique tags: ${tags.join(', ')}`);

    // Test 6: Performance Test
    console.log('\nTest 6: Performance (1000 operations)');
    const start = Date.now();
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(redis.set(`test:perf:${i}`, `value${i}`));
    }
    await Promise.all(promises);
    const duration = Date.now() - start;
    console.log(`   ✓ Completed in: ${duration}ms (${(1000/duration*1000).toFixed(0)} ops/sec)`);

    // Test 7: Cache Simulation
    console.log('\nTest 7: Caching Simulation');
    const cacheKey = 'cache:tasks:user:123:daily:2025-01-15';
    const cacheData = {
      tasks: [
        { id: 1, title: 'Morning meeting', session: 'morning' },
        { id: 2, title: 'Lunch with client', session: 'afternoon' }
      ],
      cachedAt: new Date().toISOString()
    };

    // Cache with 5 minute expiry
    await redis.setex(cacheKey, 300, JSON.stringify(cacheData));
    const cached = await redis.get(cacheKey);
    const parsedCache = JSON.parse(cached);
    console.log(`   ✓ Cached ${parsedCache.tasks.length} tasks`);
    console.log(`   ✓ Cache TTL: ${await redis.ttl(cacheKey)} seconds`);

    // Cleanup test keys
    console.log('\n🧹 Cleaning up test keys...');
    const testKeys = await redis.keys('test:*');
    const cacheKeys = await redis.keys('cache:*');
    const allKeys = [...testKeys, ...cacheKeys];

    if (allKeys.length > 0) {
      await redis.del(...allKeys);
      console.log(`   ✓ Deleted ${allKeys.length} test keys`);
    }

    // Redis Info
    console.log('\n📊 Redis Server Info:');
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    const uptime = info.match(/uptime_in_seconds:([^\r\n]+)/)?.[1];
    console.log(`   Version: ${version}`);
    console.log(`   Uptime: ${uptime} seconds (${(uptime/60).toFixed(1)} minutes)`);

    console.log('\n✅ All tests passed! Redis is ready for Time Manager.\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Your Redis is working perfectly!');
    console.log('   2. You can view Redis data at: http://localhost:8081 (Redis Commander UI)');
    console.log('   3. Ready to start Phase 1 implementation!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    redis.disconnect();
  }
}
