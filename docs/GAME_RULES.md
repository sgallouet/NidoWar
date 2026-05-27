# NidoWarWeb4X - Game Rules (Codex Reference)

## Core Loop
- Isometric 3/4 top-down tile world (Heroes of Might & Magic visual style).
- Turn-based 4X with **5 turns per day**: 6am, 1pm, 4pm, 8pm, 1am.
- Limited movement + action points per turn on the world map.

## Armies & Heroes
- Every army has one (or more) hero leader(s) carrying the empire flag + stack of units.
- **On the world map only the hero is visible**. Units are hidden until battle.
- Moving a hero onto an enemy hero's tile triggers **battle mode** (Heroes-style tactical combat).

## World Map & Economy
- Resources (mines, markets, etc.) can be captured.
- Captured resources generate gold on a regular "pay turn" schedule.
  - On pay turn a **merchant** is spawned. Merchant travels to nearest friendly castle/town at 3 tiles/turn.
  - Merchants can overlap friendly units.
  - Armies can station on resources for protection (and protect merchants).
  - Enemy can capture the merchant → it reroutes to enemy nearest castle/town.
- Consumable pickups (treasure chests) exist and are collected on contact.
- **Fog of War** active from game start.

## Terrain & Movement
- Forests hide enemies until adjacent (1 tile away) but **reduce movement speed by 50%**.
- Archers deal **30% less damage** when attacking a target on a forest tile.
- Defensive structures (towers, walls, doors) can be built and participate in combat when enemy attacks the tile.

## Castles & Towns
- **Castle capture**: Defeat defending army then occupy the tile for 3 full days (in-game).
- Castles can produce new units **only after** the required buildings have been constructed.
- **Towns**: +1 population point per week.
  - When an army enters a town, at end of turn the army can grow +1 unit per population point the town currently has.

## Battle Mode
- Tactical battles follow classic Heroes of Might & Magic rules (grid, turns, ranged/melee, obstacles, hero skills, etc.).
- (Detailed battle rules to be expanded in later phase.)

## Victory / Progression
- Standard 4X: explore, expand (capture resources/castles), exploit, exterminate.
- Detailed win conditions (e.g. last castle standing, specific objectives) TBD in design phase.

See BUILD_PLAN.md and ART_SPEC.md for implementation constraints.
