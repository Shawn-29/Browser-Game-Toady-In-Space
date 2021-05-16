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
  '../images/BarcodeBtn.png',
  '../images/BombA.png',
  '../images/BombB.png',
  '../images/BombC.png',
  '../images/BombD.png',
  '../images/BombBtn.png',
  '../images/DeleteBtn.png',
  '../images/ExitBtn.png',
  '../images/FireBtn.png',
  '../images/HPBar.png',
  '../images/IconBall.png',
  '../images/IconDrill.png',
  '../images/IconFireWave.png',
  '../images/IconLazer.png',
  '../images/IconRegular.png',
  '../images/IconCutter.png',
  '../images/NoBtn.png',
  '../images/OptionsScreen.png',
  '../images/PauseBtn.png',
  '../images/ResumeBtn.png',
  '../images/AwesomeBtn.png',
  '../images/ShotBall.png',
  '../images/Sparkle.png',
  '../images/ShotDrillA.png',
  '../images/ShotDrillB.png',
  '../images/ShotFireWave.png',
  '../images/ShotLazerA.png',
  '../images/ShotLazerB.png',
  '../images/ShotRegular.png',
  '../images/ShotCutter.png',
  '../images/StartBtn.png',
  '../images/StatusBar.png',
  '../images/TitleScreen.png',
  '../images/Toady.ico',
  '../images/Toady.png',
  '../images/ToadyKO.png',
  '../images/YesBtn.png',
  '../images/Enemies/Anchor.png',
  '../images/Enemies/BargeA.png',
  '../images/Enemies/BargeB.png',
  '../images/Enemies/BlastA_alt.png',
  '../images/Enemies/BlastB_alt.png',
  '../images/Enemies/Missile.png',
  '../images/Enemies/BossHPBar.png',
  '../images/Enemies/Domesworth.png',
  '../images/Enemies/Enemy1Shot.png',
  '../images/Enemies/Clinger.png',
  '../images/Enemies/Enemy2Shot.png',
  '../images/Enemies/Enemy3A.png',
  '../images/Enemies/Enemy3B.png',
  '../images/Enemies/Enemy4A.png',
  '../images/Enemies/Enemy4B.png',
  '../images/Enemies/Enemy4C.png',
  '../images/Enemies/Enemy5.png',
  '../images/Enemies/Enemy6A.png',
  '../images/Enemies/Enemy6B.png',
  '../images/Enemies/VectorToad.png',
  '../images/Enemies/Enemy7Shot.png',
  '../images/Enemies/LavaA.png',
  '../images/Enemies/Exp1.png',
  '../images/Enemies/Exp2.png',
  '../images/Enemies/Exp3.png',
  '../images/Icons/icon-128x128.png',
  '../images/Icons/icon-192x192.png',
  '../images/Icons/icon-256x256.png',
  '../images/Items/CoinG1.png',
  '../images/Items/CoinG2.png',
  '../images/Items/CoinG3.png',
  '../images/Items/CoinG4.png',
  '../images/Items/CoinR1.png',
  '../images/Items/CoinR2.png',
  '../images/Items/CoinR3.png',
  '../images/Items/CoinR4.png',
  '../images/Items/CoinY1.png',
  '../images/Items/CoinY2.png',
  '../images/Items/CoinY3.png',
  '../images/Items/CoinY4.png',
  '../images/Items/BombRefill.png',
  '../images/Items/ShotSwap1.png',
  '../images/Items/ShotSwap2.png',
  '../images/Items/ShotSwap3.png',
  '../images/Items/ShotSwap4.png',
  '../images/Items/SpeedBoost.png',
  '../images/Tiles/TileEurth1.png',
  '../images/Tiles/TileEurth2.png',
  '../images/Tiles/TileEurth3.png',
  '../images/Tiles/TileEurth4.png',
  '../images/Tiles/TileSpace1.png',
  '../images/Tiles/TileSpace2.png',
  '../images/Tiles/TileSpace3.png',
  '../images/Tiles/TileSpace4.png',
  '../images/Tiles/TileSpace5.png',
  '../images/Tiles/TileSpace6.png',
  '../images/Tiles/TileSpace7.png',
  '../images/Tiles/TileSpace8.png',
  '../images/Tiles/TileSpace9.png',
  '../images/Tiles/TileGoal.png',
  '../images/Tiles/TileDashRight.png',
  '../level_data/Level1.json',
  '../level_data/Level2.json',
  '../level_data/Level3.json',
  '../level_data/Level4.json',
  '../level_data/Level5.json',
  '../level_data/bizarre_tiles.json',
  '../tile_data/eurth_tiles.json',
  '../tile_data/space_tiles.json'
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
  const dataUrl = 'https://shawn-29.github.io/Progressive-Web-App/';
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