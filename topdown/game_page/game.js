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
  this.Shape = 'Square';
  this.Size = new THREE.Vector2(1, 1);
}

function Entity() {
  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(1, 1);
  this.Velocity = new THREE.Vector2();

  this.Hitbox = new Hitbox();

  this.Texture = loadedImages.characters.default.idle;
}

function Character() {
  Entity.call(this);
  
  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(30, 30);
  this.Speed = 225;
  
  this.MaxHealth = 100;
  this.Health = 100;

  this.Texture = loadedImages.characters.default.idle;
}

function Projectile() {
  Entity.call(this);

  this.Size = new THREE.Vector2(10, 10);
}

function ProjectileConstructor() {
  this.Size = new THREE.Vector2(10, 10);
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

  this.Cooldown = 0.2;
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

function Player() {
  Character.call(this);

  this.Position = new THREE.Vector2();
  this.Size = new THREE.Vector2(40, 40);
  this.Speed = 225;
  
  this.Weapon = new Weapon();

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
}

Input = {}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
// window.addEventListener('blur', windowBlurHandler);

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
  );
  let Speed = player.Speed * (player.Velocity.Magnitude > 1 ? Math.sqrt(0.5) : 1);

  player.Velocity.x *= Speed;
  player.Velocity.y *= Speed;
}

function move(object) {
  object.Position = new THREE.Vector2(object.Position.x+(object.Velocity.x*Game.DeltaTime), object.Position.y+(object.Velocity.y*Game.DeltaTime));
}

function moveObjects() {
  Game.Characters.forEach(object => {
    move(object);
  });
  Game.Projectiles.forEach(object => {
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
      ctx.translate(particle.x+particle.width/2, particle.y+particle.height/2);
      ctx.rotate(particle.rotation * (Math.PI/180));
      ctx.translate(-particle.x-particle.width/2, -particle.y-particle.height/2);
    }
    if (particle.alpha) {
      ctx.globalAlpha = particle.alpha; // Set the transparency for the background images
    }

    if (particle.img != null) {
      ctx.drawImage(particle.img, particle.x, particle.y, particle.width, particle.height);
    } else {
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

function updateParticles() {
  Game.Particles.forEach((particle, index) => {
    particle.dx += particle.ax || 0;
    particle.dy += particle.ay || 0;
    particle.dr += particle.ar || 0;

    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.rotation += particle.dr;
    particle.alpha += particle.da || 0;

    particle.lifespan--;

    if (particle.lifespan <= 0) {
      particles.splice(index, 1); // Remove particle if lifespan ends
    }
  });
}

function updateCamera() {
  Camera.Position = lerpVec2(Camera.Position, Game.Player.Position, .125)
}

function areColliding(obj1, obj2) {
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

function checkCollisions() {
  Game.Projectiles.forEach(obj1 => {
    Game.Characters.forEach(obj2 => {
      if (areColliding(obj1, obj2)) {
        
      }
    });
    Game.Enemies.forEach(obj2 => {
      
    });
  });
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

    drawObjects();
    movePlayer();
    moveObjects();
    updateCamera();

    Game.Player.Weapon.Step(Game.Player.Weapon);

    drawParticles();
    updateParticles();
  }
  requestAnimationFrame(gameLoop);
}


Promise.all([
]).then(() => {
  gameLoop();
}).catch(error => {
  console.error('Failed to load image:', error);
});
