const dataCacheName = 'data-v1',
  cacheName = 'ToadyCache';

const filesToCache = [
  '../index.html',
  '../styles/project.css',
  './barcode_scanner/video.js',
  './barcode_scanner/zxing.js',
  './enemies/asteroid.js',
  './enemies/barrier.js',
  './enemies/base_enemy.js',
  './enemies/boss.js',
  './enemies/clinger.js',
  './enemies/domesworth_v2.js',
  './enemies/domesworth.js',
  './enemies/energy_field.js',
  './enemies/fan.js',
  './enemies/lava.js',
  './enemies/philbert.js',
  './enemies/rand_enemy.js',
  './enemies/smiley_ball.js',
  './enemies/stretcher.js',
  './enemies/vector_toad.js',
  './items/bomb_refill.js',
  './items/coin_green.js',
  './items/coin_purple.js',
  './items/coin_red.js',
  './items/coin_special.js',
  './items/coin_yellow.js',
  './items/item_base.js',
  './items/random_item.js',
  './items/shot_swap.js',
  './items/speed_boost.js',
  './screens/credits_screen.js',
  './screens/game_screen.js',
  './screens/options_screen.js',
  './screens/screen.js',
  './screens/title_screen.js',
  './shots/shot_ball.js',
  './shots/shot_base.js',
  './shots/shot_beam.js',
  './shots/shot_collection.js',
  './shots/shot_cutter.js',
  './shots/shot_drill.js',
  './shots/shot_fire_wave.js',
  './shots/shot_lazer.js',
  './shots/shot_regular.js',
  './ui/button.js',
  './ui/data_button.js',
  './ui/dir_pad.js',
  './ui/img_button.js',
  './ui/modal.js',
  './user/bomb.js',
  './user/player.js',
  './user/user_mgr.js',
  './explosion_mgr.js',
  './gameplay_constants.js',
  './main.js',
  './rect.js',
  './score_sheet.js',
  './tile_mgr.js',
  './timer.js',
  './utilities.js',
  '../images/ui/BarcodeBtn.png',
  '../images/shots/BombA.png',
  '../images/shots/BombB.png',
  '../images/shots/BombC.png',
  '../images/shots/BombD.png',
  '../images/ui/BombBtn.png',
  '../images/ui/DeleteBtn.png',
  '../images/ui/ExitBtn.png',
  '../images/ui/FireBtn.png',
  '../images/ui/HPBar.png',
  '../images/icons/IconBall.png',
  '../images/icons/IconDrill.png',
  '../images/icons/IconFireWave.png',
  '../images/icons/IconLazer.png',
  '../images/icons/IconRegular.png',
  '../images/icons/IconCutter.png',
  '../images/ui/NoBtn.png',
  '../images/ui/OptionsScreen.png',
  '../images/ui/PauseBtn.png',
  '../images/ui/ResumeBtn.png',
  '../images/ui/AwesomeBtn.png',
  '../images/shots/ShotBall.png',
  '../images/shots/Sparkle.png',
  '../images/shots/ShotDrillA.png',
  '../images/shots/ShotDrillB.png',
  '../images/shots/ShotFireWave.png',
  '../images/shots/ShotLazerA.png',
  '../images/shots/ShotLazerB.png',
  '../images/shots/ShotRegular.png',
  '../images/shots/ShotCutter.png',
  '../images/ui/StartBtn.png',
  '../images/ui/StatusBar.png',
  '../images/ui/TitleScreen.png',
  '../images/icons/Toady.ico',
  '../images/player/Toady.png',
  '../images/player/ToadyKO.png',
  '../images/ui/YesBtn.png',
  '../images/enemies/Anchor.png',
  '../images/enemies/BargeA.png',
  '../images/enemies/BargeB.png',
  '../images/enemies/BlastA_alt.png',
  '../images/enemies/BlastB_alt.png',
  '../images/enemies/Missile.png',
  '../images/enemies/BossHPBar.png',
  '../images/enemies/Domesworth.png',
  '../images/enemies/DomesworthShot.png',
  '../images/enemies/Clinger.png',
  '../images/enemies/ClingerShot.png',
  '../images/enemies/StretcherA.png',
  '../images/enemies/StretcherB.png',
  '../images/enemies/PhilbertA.png',
  '../images/enemies/PhilbertB.png',
  '../images/enemies/PhilbertC.png',
  '../images/enemies/AsteroidLg.png',
  '../images/enemies/AsteroidSm.png',
  '../images/enemies/AsteroidSmInvuln.png',
  '../images/enemies/VectorToad.png',
  '../images/enemies/VectorToadShot.png',
  '../images/enemies/LavaA.png',
  '../images/enemies/LavaB.png',
  '../images/enemies/LavaC.png',
  '../images/enemies/Exp1.png',
  '../images/enemies/Exp2.png',
  '../images/enemies/Exp3.png',
  '../images/icons/icon-128x128.png',
  '../images/icons/icon-192x192.png',
  '../images/icons/icon-256x256.png',
  '../images/items/CoinG1.png',
  '../images/items/CoinG2.png',
  '../images/items/CoinG3.png',
  '../images/items/CoinG4.png',
  '../images/items/CoinR1.png',
  '../images/items/CoinR2.png',
  '../images/items/CoinR3.png',
  '../images/items/CoinR4.png',
  '../images/items/CoinY1.png',
  '../images/items/CoinY2.png',
  '../images/items/CoinY3.png',
  '../images/items/CoinY4.png',
  '../images/items/BombRefill.png',
  '../images/items/ShotSwap1.png',
  '../images/items/ShotSwap2.png',
  '../images/items/ShotSwap3.png',
  '../images/items/ShotSwap4.png',
  '../images/items/SpeedBoost.png',
  '../images/tiles/TileEurth1.png',
  '../images/tiles/TileEurth2.png',
  '../images/tiles/TileEurth3.png',
  '../images/tiles/TileEurth4.png',
  '../images/tiles/TileSpace1.png',
  '../images/tiles/TileSpace2.png',
  '../images/tiles/TileSpace3.png',
  '../images/tiles/TileSpace4.png',
  '../images/tiles/TileSpace5.png',
  '../images/tiles/TileSpace6.png',
  '../images/tiles/TileSpace7.png',
  '../images/tiles/TileSpace8.png',
  '../images/tiles/TileSpace9.png',
  '../images/tiles/TileGoal.png',
  '../images/tiles/TileDashRight.png',
  '../level_data/Level1.json',
  '../level_data/Level2.json',
  '../level_data/Level3.json',
  '../level_data/Level4.json',
  '../level_data/Level5.json',
  '../tile_data/bizarre_tiles.json',
  '../tile_data/eurth_tiles.json',
  '../tile_data/space_tiles.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName && key !== dataCacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const dataUrl = 'https://shawn-29.github.io/PWA_ToadyInSpace/';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(async (cache) => {
        const response = await fetch(e.request);
        cache.put(e.request.url, response.clone());
        return response;
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  }
});
