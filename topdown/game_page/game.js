const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pauseMenu = document.getElementById('pauseMenu');

function isDict(v) {
  return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function lerpVec2(a, b, t) {
  return new THREE.Vector2(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
}

function detectLeftButton(evt) {
  evt = evt || window.event;
  if ("buttons" in evt) {
      return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
}

let Camera = {
  Position: new THREE.Vector2(),
}

let Mouse = {
  Position: new THREE.Vector2(),
  ButtonM1: false,
  ButtonM2: false,
  ButtonM3: false,
}

document.body.onmousedown = function() {
  Mouse.ButtonM1 = true;
};

document.body.onmouseup = function() {
  Mouse.ButtonM1 = false;
};

let loadedImages = {
  other: {
    sight: 'sight.png'
  },
  orbs: {
    xp: 'xp.png'
  },
  projectiles: {},
  bosses: {},
  enemies: {},
  characters: {
    default: {
      idle: 'idle.png'
    }
  },
  particles: {},
  items: {}
}

function loadDict(dict, path) {
  for (const [key, scr] of Object.entries(dict)) {
    if (isDict(dict[key])) {
      loadDict(dict[key], path + key + '/');
    } else {
      const img = new Image();
      img.src = path + dict[key];

      dict[key] = img;
    }
  }
}

loadDict(loadedImages, 'assets/');

function Hitbox() {
  this.Shape = 'Circle';
  this.Size = new THREE.Vector2(1, 1);
}

function Entity() {
  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(1, 1);
  this.Velocity = new THREE.Vector2();

  this.Hitbox = new Hitbox();

  this.Texture = loadedImages.characters.default.idle;
}

function XpOrb() {
  Entity.call(this);

  this.Size = new THREE.Vector2(10, 10);
  this.Hitbox.Size = new THREE.Vector2(10, 10);

  this.Texture = loadedImages.orbs.xp;
}

function LivingEntity() {
  Entity.call(this);

  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(30, 30);
  this.Hitbox.Size = new THREE.Vector2(30, 30);

  this.Speed = 200;
  
  this.MaxHealth = 100;
  this.Health = 100;

  this.Dead = false;

  this.Hit = function(self, dmg, knockback) {
    if (self.Dead) { return; }

    self.Health = Math.max(self.Health-dmg, 0);
    if (self.Health <= 0) {
      self.Dead = true;
      if (self.OnDeath) {
        self.OnDeath(self);
      }

      let index = Game.Enemies.indexOf(self);
      if (index > -1) {
        Game.Enemies.splice(index, 1);
      }
    }
  }
}

function Character() {
  LivingEntity.call(this);
  
  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(30, 30);
  this.Hitbox.Size = new THREE.Vector2(30, 30);

  this.Speed = 200;
  
  this.MaxHealth = 100;
  this.Health = 100;

  this.Texture = loadedImages.characters.default.idle;
}

function Player() {
  Character.call(this);

  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(40, 40);
  this.Speed = 225;

  this.MaxHealth = 100;
  this.Health = 100;

  this.Sight = 150;
  
  this.Experience = 0;
  this.Level = 1;
  
  this.Weapon = new Weapon();

  this.Texture = loadedImages.characters.default.idle;
}

function Enemy() {
  Character.call(this);

  this.Size = new THREE.Vector2(40, 40);
  this.Speed = 100;
  
  this.MaxHealth = 50;
  this.Health = 50;

  this.Texture = loadedImages.characters.default.idle;

  this.Step = function(self) {
    self.Velocity = new THREE.Vector2(
      Game.Player.Position.x-self.Position.x,
      Game.Player.Position.y-self.Position.y
    ).normalize().multiplyScalar(self.Speed);
  }

  this.OnDeath = function(self) {
    let orb = new XpOrb();
    orb.Position = self.Position.clone();
    
    Game.Orbs.push(orb);
  }
}

function Projectile() {
  Entity.call(this);

  this.Size = new THREE.Vector2(15, 15);
  this.Hitbox.Size = new THREE.Vector2(15, 15);
  this.Damage = 15;
  this.Pierces = 0;

  this.Attack = function(self, target) {

    createHitEffect(self.Position)
    target.Hit(target, self.Damage);

    if (self.Pierces == 0) {
      let index = Game.Projectiles.indexOf(self);
      Game.Projectiles.splice(index, 1);
    }
    self.Pierces--;
  }
}

function ProjectileConstructor() {
  this.Size = new THREE.Vector2(15, 15);
  this.Speed = 750;

  this.Create = function(self) {
    let p = new Projectile();

    p.Size = self.Size.clone();
    p.Speed = this.Speed;

    Game.Projectiles.push(p);
    return p
  }
}

function Weapon() {
  this.MaxAmmo = 8;
  this.Ammo = this.MaxAmmo;
  this.Reloading = false;
  this.ReloadTime = 1;
  this.ReloadTick = 0;

  this.Cooldown = 0.225;
  this.CooldownTick = 0;

  this.ProjectileConstructor = new ProjectileConstructor();

  this.Draw = function(self) {
    ctx.save();

    ctx.globalAlpha = 0.5; // Set the transparency for the background images

    let relativePositionx = Game.Player.Position.x + ctx.canvas.width/2 - Camera.Position.x;
    let relativePositiony = Game.Player.Position.y + ctx.canvas.height/2 - Camera.Position.y;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      self.Ammo+'/'+self.MaxAmmo,
      relativePositionx - 10,
      relativePositiony - 40,
      25
    );

    if (self.Reloading) {
      let prop = self.ReloadTick/self.ReloadTime;

      let barSize = new THREE.Vector2(50, 8);

      ctx.fillStyle = '#4b4b4b';
      ctx.fillRect(
        relativePositionx-barSize.width/2, 
        relativePositiony-Game.Player.Size.height/2-barSize.height*2,
        barSize.width,
        barSize.height
      );

      ctx.fillStyle = '#969696';
      ctx.fillRect(
        relativePositionx-barSize.width/2, 
        relativePositiony-Game.Player.Size.height/2-barSize.height*2,
        barSize.width*prop,
        barSize.height
      );

      ctx.fillStyle = '#afafaf';
      ctx.fillRect(
        relativePositionx-barSize.width/2+prop*barSize.width, 
        relativePositiony-Game.Player.Size.height/2-(barSize.height+10),
        3,
        barSize.height+4
      );
    }
    ctx.restore();
    ctx.globalAlpha = 1; // Reset the transparency to default (fully opaque)
  }

  this.Attack = function(self) {
    if (self.Ammo > 0 && this.CooldownTick <= 0) {
      self.Ammo--;
      self.CooldownTick = self.Cooldown;

      let p = self.ProjectileConstructor.Create(self.ProjectileConstructor);
      p.Position = Game.Player.Position;
      p.Velocity = new THREE.Vector2(
        (Mouse.Position.x-canvas.width/2), 
        (Mouse.Position.y-canvas.height/2)
      ).normalize().multiplyScalar(p.Speed);
    }
  }

  this.Step = function(self) {
    self.CooldownTick = Math.max(self.CooldownTick - Game.DeltaTime, 0);
    if (self.Reloading && !(Mouse.ButtonM1 && self.Ammo > 0)) {
      if (self.ReloadTick > 0) {
        self.ReloadTick = Math.max(self.ReloadTick - Game.DeltaTime, 0);
      } else {
        self.Reloading = false;
        self.ReloadTick = 0;
        self.Ammo = self.MaxAmmo;
      }
    } else if (
      (self.Ammo < self.MaxAmmo) &&
      ((self.Ammo > 0 && !Mouse.ButtonM1) || (self.Ammo <= 0))
    ) {
      self.Reloading = true;
      self.ReloadTick = self.ReloadTime;
    } else {
      self.Reloading = false;
      self.ReloadTick = 0;
    }

    if (Mouse.ButtonM1) {
      self.Attack(self);
    }

    self.Draw(self);
  }

  this.Texture = loadedImages.characters.default.idle;
}

Game = {
  Over: false,
  Paused: false,

  LastUpdate: Date.now(),
  DeltaTime: 0,

  Player: null,
  Characters: [],
  Entities: [],
  Enemies: [],
  Projectiles: [],
  Particles: [],
  Orbs: [],

  LastSpawn: Date.now(),
}

Input = {}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
window.addEventListener('blur', windowBlurHandler);

function windowBlurHandler() {
  if (!Game.Paused) {
    togglePause();
  }
}

function togglePause() {
  Game.Paused = !Game.Paused;
  if (Game.Paused) {
    pauseMenu.classList.remove('hidden');
  } else {
    pauseMenu.classList.add('hidden');
  }
}

function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
    Input['Right'] = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
    Input['Left'] = true;
  } else if (e.key == 'Up' || e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
    Input['Up'] = true;
  } else if (e.key == 'Down' || e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
    Input['Down'] = true;
  } else if (e.key == 'Escape') {
    e.preventDefault();
    togglePause();
  } else if (e.key == ' ') {
    e.preventDefault();
    Input['Space'] = true;
  }
}
function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
    Input['Right'] = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
    Input['Left'] = false;
  } else if (e.key == 'Up' || e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
    Input['Up'] = false;
  } else if (e.key == 'Down' || e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
    Input['Down'] = false;
  } else if (e.key == ' ') {
    Input['Space'] = false;
  }
}

Game.Player = new Player();
Game.Characters.push(Game.Player);

function movePlayer(player = Game.Player) {

  player.Velocity = new THREE.Vector2(
    Input.Right ? 1 : Input.Left ? -1 : 0,
    Input.Up ? -1 : Input.Down ? 1 : 0
  ).normalize().multiplyScalar(player.Speed);
}

function move(object) {
  if (object.Step) {
    object.Step(object);
  }
  object.Position = new THREE.Vector2(object.Position.x+(object.Velocity.x*Game.DeltaTime), object.Position.y+(object.Velocity.y*Game.DeltaTime));
}

function moveObjects() {
  Game.Characters.forEach(object => {
    move(object);
  });
  Game.Enemies.forEach(object => {
    move(object);
  });
  Game.Projectiles.forEach(object => {
    move(object);
  });
  Game.Orbs.forEach(object => {
    move(object);
  });
}

function draw(object) {
  ctx.save();
  if (object.Rotation != null) {
    ctx.translate(object.Position.x+object.width/2, object.Position.y+object.height/2);
    ctx.rotate(object.Rotation * (Math.PI/180));
    ctx.translate(-object.Position.x-object.width/2, -object.Position.y-object.height/2);
  }
  if (object.Alpha) {
    ctx.globalAlpha = object.Alpha; // Set the transparency for the background images
  }

  if (object.Rotation != null) {
    ctx.drawImage(object.Texture,
        object.Position.x+ctx.canvas.width/2,
        object.Position.y+ctx.canvas.height/2,
        object.Size.width,
        object.Size.height
      );
  } else {
    ctx.drawImage(object.Texture,
      object.Position.x - object.Size.width/2 + ctx.canvas.width/2 - Camera.Position.x,
      object.Position.y - object.Size.height/2 + ctx.canvas.height/2 - Camera.Position.y,
      object.Size.width,
      object.Size.height
    );
  }

  ctx.restore();
  ctx.globalAlpha = 1; // Reset the transparency to default (fully opaque)
}

function drawObjects() {
  Game.Orbs.forEach(object => {
    draw(object);
  });
  Game.Enemies.forEach(object => {
    draw(object);
  });
  Game.Characters.forEach(object => {
    draw(object);
  });
  Game.Projectiles.forEach(object => {
    draw(object);
  });
}


function drawParticles() {
  Game.Particles.forEach(particle => {

    ctx.save();
    if (particle.rotation != null) {
      ctx.translate(particle.Position.x+particle.Size.width/2, particle.Position.y+particle.Size.height/2);
      ctx.rotate(particle.Rotation * (Math.PI/180));
      ctx.translate(-particle.Position.x-particle.Size.width/2, -particle.Position.y-particle.Size.height/2);
    }
    if (particle.Alpha) {
      ctx.globalAlpha = particle.Alpha; // Set the transparency for the background images
    }

    if (particle.Texture != null) {
      ctx.drawImage(particle.img, particle.Position.x, particle.Position.y, particle.Size.width, particle.Size.height);
    } else {
      ctx.fillStyle = particle.Color;
      ctx.fillRect(
        particle.Position.x - particle.Size.width/2 + ctx.canvas.width/2 - Camera.Position.x,
        particle.Position.y - particle.Size.height/2 + ctx.canvas.height/2 - Camera.Position.y,
        particle.Size.width,
        particle.Size.height
      );
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

function updateParticles() {
  Game.Particles.forEach((particle, index) => {

    particle.Position.x += particle.Velocity.x;
    particle.Position.y += particle.Velocity.y;
    particle.Rotation += particle.AngularVelocity;
    //particle.Alpha += particle.da || 0;

    particle.Lifespan--;

    if (particle.Lifespan <= 0) {
      Game.Particles.splice(index, 1); // Remove particle if lifespan ends
    }
  });
}

function createHitEffect(pos) {
  const numParticles = 10;
  const particleSize = 3;

  for (let i = 0; i < numParticles; i++) {
    const particle = {
      Position: pos.clone(),
      Rotation: 0,
      Velocity: new THREE.Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1),
      AngularVelocity: 0,
      Alpha: 1,
      Color: `rgba(255, 255, 255, 1)`,
      Size: new THREE.Vector2(particleSize, particleSize),
      Lifespan: Math.random() * 30
    };

    Game.Particles.push(particle);
  }
}

function updateCamera() {
  Camera.Position = lerpVec2(Camera.Position, Game.Player.Position, .1)
}

function areColliding(obj1, obj2) {
  if (obj1.Hitbox.Shape == 'Circle' && obj2.Hitbox.Shape == 'Circle') {
    const dx = obj1.Position.x - obj2.Position.x;
    const dy = obj1.Position.y - obj2.Position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < obj1.Size.width/2 + obj2.Size.width/2) {
      return true;
    } else {
      return false;
    }

  } else if (obj1.Hitbox.Shape == 'Square' && obj2.Hitbox.Shape == 'Square') {
    if (
      obj1.Position.x < obj2.Position.x + obj2.Hitbox.Size.width &&
      obj1.Position.x + obj1.Hitbox.Size.width > obj2.Position.x &&
      obj1.Position.y < obj2.Position.y + obj2.Hitbox.Size.height &&
      obj1.Position.y + obj1.Hitbox.Size.height > obj2.Position.y
    ) {
      return true;
    } else {
      return false;
    }
  }

}

function checkCollisions() {
  Game.Characters.forEach(obj1 => {
    Game.Orbs.forEach(obj2 => {
      if (areColliding(obj1, obj2)) {
        let index = Game.Orbs.indexOf(obj2);
        if (index > -1) {
          Game.Orbs.splice(index, 1);
        }
      } else {
        let ls = new THREE.Vector2(obj1.Position.x-obj2.Position.x, obj1.Position.y-obj2.Position.y);
        if (ls.length() < Game.Player.Sight) {
          obj2.Velocity = ls.normalize().multiplyScalar(Game.Player.Sight/ls.length()*5);
        } else {
          obj2.Velocity = new THREE.Vector2(0, 0);
        }
      }
    });
  });

  Game.Projectiles.forEach(obj1 => {
    Game.Characters.forEach(obj2 => {
      if (areColliding(obj1, obj2)) {
        // console.log('collision!');
      }
    });
    Game.Enemies.forEach(obj2 => {
      if (areColliding(obj1, obj2)) {
        obj1.Attack(obj1, obj2);
      }
    });
  });
}

function spawnEnemy() {
  let deg = Math.random()*360;

  let e = new Enemy();
  e.Position = new THREE.Vector2(Math.cos(deg)*750, Math.sin(deg)*750).add(Game.Player.Position);

  Game.Enemies.push(e);
}

function spawnStep() {
  if (Date.now()-Game.LastSpawn > 1000) {
    Game.LastSpawn = Date.now();
    spawnEnemy();
  }
}

const backgroundImage = new Image();
backgroundImage.src = 'assets/images/background.png';

let backgroundX = 0; // Initial y-coordinate of the background
let backgroundY = 0; // Initial y-coordinate of the background
let backgroundSize = 1000

let backgroundAlpha = 0.5; // Adjust this value between 0 (fully transparent) and 1 (fully opaque)

function drawBackground() {
  ctx.globalAlpha = backgroundAlpha; // Set the transparency for the background images

  // Draw the background images
  ctx.drawImage(backgroundImage, backgroundX, backgroundY, backgroundSize, backgroundSize);
  ctx.drawImage(backgroundImage, backgroundX-backgroundSize, backgroundY, backgroundSize, backgroundSize);
  ctx.drawImage(backgroundImage, backgroundX, backgroundY - backgroundSize, backgroundSize, backgroundSize);
  ctx.drawImage(backgroundImage, backgroundX-backgroundSize, backgroundY - backgroundSize, backgroundSize, backgroundSize);

  ctx.globalAlpha = 1; // Reset the transparency to default (fully opaque)
}

function moveBackground() {
  
  backgroundX = -Camera.Position.x % backgroundSize;
  backgroundY = -Camera.Position.y % backgroundSize;
}

function tick() {
    var now = Date.now();
    var dt = now - Game.LastUpdate;
    Game.LastUpdate = now;
    Game.DeltaTime = dt/1000;
}

function drawSight() {
  ctx.globalAlpha = 0.3;

  ctx.fillStyle = '#000000';

  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.moveTo(0, 0);

  ctx.arc(ctx.canvas.width/2, ctx.canvas.height/2, Game.Player.Sight, 0, Math.PI * 2, true);

  ctx.lineTo(0, 0);
  ctx.lineTo(0, ctx.canvas.height);
  ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
  ctx.lineTo(ctx.canvas.width, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(ctx.canvas.width/2, ctx.canvas.height/2);

  ctx.fill('evenodd');

  ctx.globalAlpha = 1;
}

document.addEventListener('mousemove', (event) => {
  Mouse.Position = new THREE.Vector2(event.clientX, event.clientY);
});

function gameLoop() {
  ctx.canvas.width  = window.innerWidth-2;
  ctx.canvas.height = window.innerHeight-2;

  tick();

	if (Game.Over) {
    drawGameOverScreen();
    return; // Stop game loop if game is over
  }
	
  if (!Game.Paused) {
    
    drawBackground();
    moveBackground();

    spawnStep();

    drawObjects();
    movePlayer();
    moveObjects();
    updateCamera();

    checkCollisions();

    Game.Player.Weapon.Step(Game.Player.Weapon);

    drawParticles();
    updateParticles();

    drawSight();
  }
  requestAnimationFrame(gameLoop);
}


Promise.all([
]).then(() => {
  gameLoop();
}).catch(error => {
  console.error('Failed to load image:', error);
});
