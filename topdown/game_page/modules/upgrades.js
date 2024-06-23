
function Tree() {
  this.Class = 'Tree';
  this.Name = 'Tree';
  this.Levels = {}
}

function Trait() {
  this.Class = 'Trait';
  this.Tree = null;
  this.Options = {}
}

function Upgrade() {
  this.Class = 'Upgrade';
  this.Name = 'Template';
  this.Type = 'Passive';
  this.Tree = null;

  this.Activate = function() {}
  this.Deactivate = function() {}
  this.Step = function() {}
}

let UpgradeTrees = {
    ['Movement']: new Tree(),
    ['Magazine']: new Tree(),
    ['Shield']: new Tree(),
    ['Multishoot']: new Tree(),
    ['Strength']: new Tree()
}

// MOVEMENT UPGRADE

UpgradeTrees.Movement.Name = 'Movement';
UpgradeTrees.Movement.Levels[1] = new Upgrade();
UpgradeTrees.Movement.Levels[1].Tree = UpgradeTrees.Movement.Name;
UpgradeTrees.Movement.Levels[1].Name = 'Haste';
UpgradeTrees.Movement.Levels[1].Description = 'Gives +10% speed';
UpgradeTrees.Movement.Levels[1].Activate = function(plr) {
  plr.Modifiers.Speed += 10;
}
UpgradeTrees.Movement.Levels[1].Deactivate = function(plr) {
  plr.Modifiers.Speed -= 10;
}
UpgradeTrees.Movement.Levels[1].Step = function(self, plr) { }

// STRONG UPGRADE

UpgradeTrees.Strength.Name = 'Strength';
UpgradeTrees.Strength.Levels[1] = new Upgrade();
UpgradeTrees.Strength.Levels[1].Tree = UpgradeTrees.Strength.Name;
UpgradeTrees.Strength.Levels[1].Name = 'Advanced Munition';
UpgradeTrees.Strength.Levels[1].Description = '+10% Damage';
UpgradeTrees.Strength.Levels[1].Activate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Damage += 10;
}
UpgradeTrees.Strength.Levels[1].Deactivate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Damage -= 10;
}
UpgradeTrees.Strength.Levels[1].Step = function(self, plr) { }

UpgradeTrees.Strength.Levels[2] = new Trait();
UpgradeTrees.Strength.Levels[2].Tree = UpgradeTrees.Strength.Name;

UpgradeTrees.Strength.Levels[2].Options[1] = new Upgrade();
UpgradeTrees.Strength.Levels[2].Options[1].Tree = UpgradeTrees.Strength.Name;
UpgradeTrees.Strength.Levels[2].Options[1].Name = 'Enormus Attack';
UpgradeTrees.Strength.Levels[2].Options[1].Description = '+40% Projectile Size/n5% Projectile Speed';
UpgradeTrees.Strength.Levels[2].Options[1].Activate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Size += 40;
  plr.Weapon.ProjectileConstructor.Modifiers.Speed -= 5;
}
UpgradeTrees.Strength.Levels[2].Options[1].Deactivate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Size -= 40;
  plr.Weapon.ProjectileConstructor.Modifiers.Speed += 5;
}
UpgradeTrees.Strength.Levels[2].Options[1].Step = function(self, plr) { }

UpgradeTrees.Strength.Levels[2].Options[2] = new Upgrade();
UpgradeTrees.Strength.Levels[2].Options[2].Tree = UpgradeTrees.Strength.Name;
UpgradeTrees.Strength.Levels[2].Options[2].Name = 'Sniper Accuracy';
UpgradeTrees.Strength.Levels[2].Options[2].Description = '-5 Spread/n-15% Projectile Size/n+15% Damage/n+15% Projectile Speed';
UpgradeTrees.Strength.Levels[2].Options[2].Activate = function(plr) {
  plr.Weapon.Spread -= 5;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage += 15;
  plr.Weapon.ProjectileConstructor.Modifiers.Size -= 15;
  plr.Weapon.ProjectileConstructor.Modifiers.Speed += 15;
}
UpgradeTrees.Strength.Levels[2].Options[2].Deactivate = function(plr) {
  plr.Weapon.Spread += 5;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage -= 15;
  plr.Weapon.ProjectileConstructor.Modifiers.Size += 15;
  plr.Weapon.ProjectileConstructor.Modifiers.Speed -= 15;
}
UpgradeTrees.Strength.Levels[2].Options[2].Step = function(self, plr) { }

UpgradeTrees.Strength.Levels[2].Options[3] = new Upgrade();
UpgradeTrees.Strength.Levels[2].Options[3].Tree = UpgradeTrees.Strength.Name;
UpgradeTrees.Strength.Levels[2].Options[3].Name = 'Heavy Arsenal';
UpgradeTrees.Strength.Levels[2].Options[3].Description = '+15% Damage/n+15% Knockback';
UpgradeTrees.Strength.Levels[2].Options[3].Activate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Damage += 15;
}
UpgradeTrees.Strength.Levels[2].Options[3].Deactivate = function(plr) {
  plr.Weapon.ProjectileConstructor.Modifiers.Damage -= 15;
}
UpgradeTrees.Strength.Levels[2].Options[3].Step = function(self, plr) { }

// MULTISHOOT UPGRADE

UpgradeTrees.Multishoot.Name = 'Multishoot';
UpgradeTrees.Multishoot.Levels[1] = new Upgrade();
UpgradeTrees.Multishoot.Levels[1].Tree = UpgradeTrees.Multishoot.Name;
UpgradeTrees.Multishoot.Levels[1].Name = 'Multishoot';
UpgradeTrees.Multishoot.Levels[1].Description = '+2 Additional Projectiles/n+20 Spread/n-15% Damage';
UpgradeTrees.Multishoot.Levels[1].Activate = function(plr) {
  plr.Weapon.ProjectileCount += 2;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage -= 15;
  plr.Weapon.Spread += 20;
}
UpgradeTrees.Multishoot.Levels[1].Deactivate = function(plr) {
  plr.Weapon.ProjectileCount -= 2;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage += 15;
  plr.Weapon.Spread += 20;
}
UpgradeTrees.Multishoot.Levels[1].Step = function(self, plr) { }

UpgradeTrees.Multishoot.Levels[2] = new Trait();
UpgradeTrees.Multishoot.Levels[2].Tree = UpgradeTrees.Multishoot.Name;

UpgradeTrees.Multishoot.Levels[2].Options[1] = new Upgrade();
UpgradeTrees.Multishoot.Levels[2].Options[1].Tree = UpgradeTrees.Multishoot.Name;
UpgradeTrees.Multishoot.Levels[2].Options[1].Name = 'Omnidirectional Shootage';
UpgradeTrees.Multishoot.Levels[2].Options[1].Description = '+3 Additional Projectiles/n+Omnidirectional Shooting/n-25% Damage';
UpgradeTrees.Multishoot.Levels[2].Options[1].Activate = function(plr) {
  plr.Weapon.ProjectileCount += 3;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage -= 25;
  plr.Weapon.AutoSpread = true;
}
UpgradeTrees.Multishoot.Levels[2].Options[1].Deactivate = function(plr) {
  plr.Weapon.ProjectileCount -= 3;
  plr.Weapon.ProjectileConstructor.Modifiers.Damage += 25;
  plr.Weapon.AutoSpread = false;
}
UpgradeTrees.Multishoot.Levels[2].Options[1].Step = function(self, plr) { }

UpgradeTrees.Multishoot.Levels[2].Options[2] = new Upgrade();
UpgradeTrees.Multishoot.Levels[2].Options[2].Tree = UpgradeTrees.Multishoot.Name;
UpgradeTrees.Multishoot.Levels[2].Options[2].Name = 'Precise Burst';
UpgradeTrees.Multishoot.Levels[2].Options[2].Description = '-10 Spread';
UpgradeTrees.Multishoot.Levels[2].Options[2].Activate = function(plr) {
  plr.Weapon.Spread -= 12;
}
UpgradeTrees.Multishoot.Levels[2].Options[2].Deactivate = function(plr) {
  plr.Weapon.Spread += 12;
}
UpgradeTrees.Multishoot.Levels[2].Options[2].Step = function(self, plr) { }

// MAGAZINE UPGRADE

UpgradeTrees.Magazine.Name = 'Magazine';
UpgradeTrees.Magazine.Levels[1] = new Upgrade();
UpgradeTrees.Magazine.Levels[1].Tree = UpgradeTrees.Magazine.Name;
UpgradeTrees.Magazine.Levels[1].Name = 'Fast Reload';
UpgradeTrees.Magazine.Levels[1].Description = 'Gives +10% Reload Speed';
UpgradeTrees.Magazine.Levels[1].Activate = function(plr) {
  plr.Weapon.Modifiers.ReloadSpeed += 10;
}
UpgradeTrees.Magazine.Levels[1].Deactivate = function(plr) {
  plr.Weapon.Modifiers.ReloadSpeed -= 10;
}
UpgradeTrees.Magazine.Levels[1].Step = function(self, plr) { }


UpgradeTrees.Magazine.Levels[2] = new Trait();
UpgradeTrees.Magazine.Levels[2].Tree = UpgradeTrees.Magazine.Name;

UpgradeTrees.Magazine.Levels[2].Options[1] = new Upgrade();
UpgradeTrees.Magazine.Levels[2].Options[1].Tree = UpgradeTrees.Magazine.Name;
UpgradeTrees.Magazine.Levels[2].Options[1].Name = 'Capacity';
UpgradeTrees.Magazine.Levels[2].Options[1].Description = '+10 Max Ammo';
UpgradeTrees.Magazine.Levels[2].Options[1].Activate = function(plr) {
  plr.Weapon.MaxAmmo += 10;
}
UpgradeTrees.Magazine.Levels[2].Options[1].Deactivate = function(plr) {
  plr.Weapon.MaxAmmo -= 10;
}
UpgradeTrees.Magazine.Levels[2].Options[1].Step = function(self, plr) { }

UpgradeTrees.Magazine.Levels[2].Options[2] = new Upgrade();
UpgradeTrees.Magazine.Levels[2].Options[2].Tree = UpgradeTrees.Magazine.Name;
UpgradeTrees.Magazine.Levels[2].Options[2].Name = 'Bullet Burst';
UpgradeTrees.Magazine.Levels[2].Options[2].Description = '-2 Max Ammo/n+15% Reload Speed';
UpgradeTrees.Magazine.Levels[2].Options[2].Activate = function(plr) {
  plr.Weapon.MaxAmmo -= 2;
  plr.Weapon.Modifiers.ReloadSpeed += 15;
}
UpgradeTrees.Magazine.Levels[2].Options[2].Deactivate = function(plr) {
  plr.Weapon.MaxAmmo += 2;
  plr.Weapon.Modifiers.ReloadSpeed -= 15;
}
UpgradeTrees.Magazine.Levels[2].Options[2].Step = function(self, plr) { }

// SHIELDS UPGRADE

// Upgrade 1
UpgradeTrees.Shield.Name = 'Shield';
UpgradeTrees.Shield.Levels[1] = new Upgrade();
UpgradeTrees.Shield.Levels[1].Tree = UpgradeTrees.Shield.Name;
UpgradeTrees.Shield.Levels[1].Name = 'Forcefield';
UpgradeTrees.Shield.Levels[1].Description = `+1 Max Shields/nEvery 90s regens`;
UpgradeTrees.Shield.Levels[1].Activate = function(plr) {
  plr.MaxShields += 1;
  plr.ShieldCooldown += 90;
}
UpgradeTrees.Shield.Levels[1].Deactivate = function(plr) {
  plr.MaxShields -= 1;
  plr.ShieldCooldown -= 90;
}
UpgradeTrees.Shield.Levels[1].Step = function(self, plr) { }

// Upgrade 2
UpgradeTrees.Shield.Levels[2] = new Upgrade();
UpgradeTrees.Shield.Levels[2].Tree = UpgradeTrees.Shield.Name;
UpgradeTrees.Shield.Levels[2].Name = 'Better Forcefield';
UpgradeTrees.Shield.Levels[2].Description = `+1 Max Shields/n-10s RegenTime`;
UpgradeTrees.Shield.Levels[2].Activate = function(plr) {
  plr.MaxShields += 1;
  plr.ShieldCooldown -= 10;
}
UpgradeTrees.Shield.Levels[1].Deactivate = function(plr) {
  plr.MaxShields -= 1;
  plr.ShieldCooldown += 10;
}
UpgradeTrees.Shield.Levels[1].Step = function(self, plr) { }

// Trait 3
UpgradeTrees.Shield.Levels[3] = new Trait();
UpgradeTrees.Shield.Levels[3].Tree = UpgradeTrees.Shield.Name;

UpgradeTrees.Shield.Levels[3].Options[1] = new Upgrade();
UpgradeTrees.Shield.Levels[3].Options[1].Tree = UpgradeTrees.Shield.Name;
UpgradeTrees.Shield.Levels[3].Options[1].Name = 'Onion Skin';
UpgradeTrees.Shield.Levels[3].Options[1].Description = '+1 Max Shields/n+10s RegenTime';
UpgradeTrees.Shield.Levels[3].Options[1].Activate = function(plr) {
  plr.MaxShields += 1;
  plr.ShieldCooldown += 10;
}
UpgradeTrees.Shield.Levels[3].Options[1].Deactivate = function(plr) {
  plr.MaxShields -= 1;
  plr.ShieldCooldown -= 10;
}
UpgradeTrees.Shield.Levels[3].Options[1].Step = function(self, plr) { }

UpgradeTrees.Shield.Levels[3].Options[2] = new Upgrade();
UpgradeTrees.Shield.Levels[3].Options[2].Tree = UpgradeTrees.Shield.Name;
UpgradeTrees.Shield.Levels[3].Options[2].Name = 'Fast Reconstruction';
UpgradeTrees.Shield.Levels[3].Options[2].Description = '-1 Max Shields/n-15s RegenTime';
UpgradeTrees.Shield.Levels[3].Options[2].Activate = function(plr) {
  plr.MaxShields -= 1;
  plr.ShieldCooldown -= 15;
}
UpgradeTrees.Shield.Levels[3].Options[2].Deactivate = function(plr) {
  plr.MaxShields += 1;
  plr.ShieldCooldown += 15;
}
UpgradeTrees.Shield.Levels[3].Options[2].Step = function(self, plr) { }

function treeCompleted(tree) {
  return UpgradeTrees[tree].Levels[Game.Player.Trees[tree] || 1] != null;
}

function randomTree() {
  const keys = Object.keys(UpgradeTrees).filter(treeCompleted);
    
  return keys[Math.floor(Math.random() * keys.length)];
}