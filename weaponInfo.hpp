
#include <string>
using namespace std;

enum weaponVariety { PROJECTILE, MISSILE };

struct WeaponInfo {
    weaponVariety variety;
    float radius;
    int cooldown; // milliseconds
    float speed;
    float damage;
    int chargeTime; // milliseconds
    int projectileCount;
};

struct {
    WeaponInfo basic;
    //WeaponInfo tomato;
    //WeaponInfo olive;
    //WeaponInfo pickle;
    //WeaponInfo anchovy;
    //WeaponInfo meatball;
    //WeaponInfo asparagus;
    //WeaponInfo groundBeef;
} weaponSpecs;

void initWeaponSpecs() {
    weaponSpecs.basic.variety = PROJECTILE;
    weaponSpecs.basic.radius = .5;
    weaponSpecs.basic.cooldown = 1000; // milliseconds
    weaponSpecs.basic.speed = .0375; // units/millisecond
    weaponSpecs.basic.damage = 10;
    weaponSpecs.basic.chargeTime = 0; // milliseconds
    weaponSpecs.basic.projectileCount = 1;
}
  
