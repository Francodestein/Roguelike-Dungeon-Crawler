import React, { Component } from 'react';
import './App.css';
import $ from "jquery";
import './index.js';
var _ = require('lodash');
var Button = require('react-bootstrap/lib/Button');

var widthCompute = window.innerWidth % 200
var width = (window.innerWidth - widthCompute) / 20;
$(".board").width(width)
var height = 70;
var board = [];
var rooms = [];
var placedRooms = [];
var enemyPool = [];
var healPool = [];
var armorPool = [];
var floorTiles = [];
var count = 0;
var dark = true;
var active = true;
var audio = new Audio("65_Dungeon_I.mp3")
audio.loop = true;
var player, eventFlag;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: board,
      event: "You are walking in an unsavoury dungeon...",
      dungeonLevel: 1,
      bossLocationY: 0,
      bossLocationX: 0,
      weapon: "",
      damage: "",
      armor: "",
      health: "",
      level: "",
      exp: "",
      enemy: "None",
      enemyHealth: "None",
      enemyDamage: "None",
      enemyArmor: "None",
      enemyLevel: "None",
      lvlAnim: false,
      gameover: false,
      youwon: false
    }
    //this.tileQuery = this.tileQuery.bind(this)
    this.again = this.again.bind(this)
    this.toggleDarkness = this.toggleDarkness.bind(this)
    this.handleClick = this.handleClick.bind(this)
    //this.anim = this.anim.bind(this)
  }
  setBoard() {
    var Y = 0;
    for (var i=0; i < height; i++) {
      board[i] = new Array(width)
    }
    for (var k = 0 ; k < height; k++) {
      for (var z = 0; z < width; z++) {
        board[k][z] = {id: z, status: "cells wall darkness", x:z, y:Y, passable: 0, tile_type: "wall", char: null}
      }
      Y++
    }
    this.setState({board: board})
  }
  tile (y, x) {
    return board[y][x]
  }
  room (y,x,h,w,stat,type,cost) {
    this.y = y;
    this.x = x;
    this.h = h;
    this.w = w;
    for (var i = y; i<h+y; i++) {
      for (var j = x; j<w+x; j++) {
        this.tile(i,j).status    = stat
        this.tile(i,j).tile_type = type
        this.tile(i,j).passable  = cost
      }
    }
  }
  setFirstRoom (maxRooms, maxHeight, maxWidth) {
    count = 0
    let seed = []
    let firstW = _.random(5, maxWidth)
    let firstH = _.random(5, maxHeight)
    let firstX = _.random(1, width-1-firstW)
    let firstY = _.random(1, height-1-firstH)
    seed = [{y: firstY, x: firstX, height: firstH, width: firstW}]
    if (this.isAvailableforRoom(seed[0].y, seed[0].x, seed[0].height, seed[0].width)) {
      this.room(seed[0].y, seed[0].x, seed[0].height, seed[0].width, "cells floor darkness", "floor")
      count++
      this.setRooms (seed, maxRooms, maxHeight, maxWidth)
    } else if (count === 0){
      this.setFirstRoom(100, 20, 20)
    }
  }
  setRooms(array, maxRooms, maxHeight, maxWidth) {
    rooms = array.slice()
    var roomW = rooms[rooms.length-1].width, roomH = rooms[rooms.length-1].height, roomX = rooms[rooms.length-1].x, roomY = rooms[rooms.length-1].y
    placedRooms = []
    const west = {width: _.random(5, maxWidth), height: _.random(5, maxHeight)}
    west.x = roomX - west.width - 1
    west.y = _.random(roomY-west.height+1, roomY+roomH-1)
    west.doorX = roomX - 1
    west.doorY = function () {
      if (west.y < roomY && west.y+west.height <= roomY+roomH) {
        return _.random(roomY, (west.y+west.height)-1)
      } else if (west.y < roomY && west.y+west.height >= roomY+roomH) {
        return _.random(roomY, roomY+roomH-1)
      } else if (west.y > roomY && west.y+west.height >= roomY+roomH) {
        return _.random(west.y, roomY+roomH-1)
      } else if (west.y > roomY && west.y+west.height <= roomY+roomH){
        return _.random(west.y, (west.y+west.height)-1)
      } else if (west.y === roomY) {
        return _.random(west.y, Math.min(west.y+west.height - 1, roomY+roomH - 1))
      }
    }()
    //west.direction = "W"
    rooms.push(west)

    const east = {width: _.random(5, maxWidth), height: _.random(5, maxHeight)}
    east.x = roomX + roomW + 1
    east.y = _.random(roomY-east.height+1, roomY+roomH-1)
    east.doorX = east.x - 1
    east.doorY = function () {
      if (east.y < roomY && east.y+east.height <= roomY+roomH) {
        return _.random(roomY, (east.y+east.height)-1)
      } else if (east.y < roomY && east.y+east.height >= roomY+roomH) {
        return _.random(roomY, roomY+roomH-1)
      } else if (east.y > roomY && east.y+east.height >= roomY+roomH) {
        return _.random(east.y, roomY+roomH-1)
      } else if (east.y > roomY && east.y+east.height <= roomY+roomH){
        return _.random(east.y, (east.y+east.height)-1)
      } else if (east.y === roomY) {
        return _.random(east.y, Math.min(east.y+east.height - 1, roomY+roomH - 1))
      }
    }()
    //east.direction = "E"
    rooms.push(east)

    const north = {width: _.random(5, maxWidth), height: _.random(5, maxHeight)}
    north.x = _.random(roomX-north.width+1, roomX+roomW-1)
    north.y = roomY - north.height - 1
    north.doorX = function () {
      if (north.x < roomX && north.x+north.width <= roomX+roomW) {
        return _.random(roomX, (north.x+north.width)-1)
      } else if (north.x < roomX && north.x+north.width >= roomX+roomW) {
        return _.random(roomX, roomX+roomW-1)
      } else if (north.x > roomX && north.x+north.width >= roomX+roomW) {
        return _.random(north.x, roomX+roomW-1)
      } else if (north.x > roomX && north.x+north.width <= roomX+roomW){
        return _.random(north.x, (north.x+north.width)-1)
      } else if (north.x === roomX) {
        return _.random(north.x, Math.min(north.x+north.width - 1, roomX+roomW - 1))
      }
    }()
    north.doorY = roomY - 1
    //north.direction = "N"
    rooms.push(north)

    const south = {width: _.random(5, maxWidth), height: _.random(5, maxHeight)}
    south.x = _.random(roomX-south.width+1, roomX+roomW-1)
    south.y = roomY + roomH + 1
    south.doorX = function () {
      if (south.x < roomX && south.x+south.width <= roomX+roomW) {
        return _.random(roomX, (south.x+south.width)-1)
      } else if (south.x < roomX && south.x+south.width >= roomX+roomW) {
        return _.random(roomX, roomX+roomW-1)
      } else if (south.x > roomX && south.x+south.width >= roomX+roomW) {
        return _.random(south.x, roomX+roomW-1)
      } else if (south.x > roomX && south.x+south.width <= roomX+roomW){
        return _.random(south.x, (south.x+south.width)-1)
      } else if (south.x === roomX) {
        return _.random(south.x, Math.min(south.x+south.width - 1, roomX+roomW - 1))
      }
    }()
    south.doorY = roomY + roomH
    //south.direction = "S"
    rooms.push(south)

    rooms.forEach((room) => {
      if (this.isAvailableforRoom(room.y, room.x, room.height, room.width) && count < maxRooms) {
        this.room(room.y, room.x, room.height, room.width, "cells floor darkness", "floor", 1 )
        this.room(room.doorY, room.doorX, 1, 1, "cells door darkness", "door", 1)
        placedRooms.push(room)
        count++
      }
    })
    if (count < maxRooms) {
      if (placedRooms.length > 0) {
        this.setRooms(placedRooms, maxRooms, 20, 20)
      } else {
        return
      }
    }
  }

  isAvailableforRoom (top, left, bottom, right) {
    for (var row = top; row<top+bottom; row++) {
      for (var col = left; col<left+right; col++) {
        if (top+bottom > height - 3 || left+right > width - 3 || top < 3 || left < 3) {
          return false
        }
        if ((this.tile(row, col).status === "cells floor darkness" || this.tile(row+1, col).status === "cells floor darkness"
        || this.tile(row-1, col).status === "cells floor darkness" || this.tile(row, col+1).status === "cells floor darkness"
        || this.tile(row, col-1).status === "cells floor darkness")) {
          return false
        }
        if (right < 4 || bottom < 4) {
          return false
        }
      }
    }
    return true
  }

  /*tileQuery (e) {
    var coorX = e.target.dataset.x
    var coorY = e.target.dataset.y
    this.setState({info: coorX + ", " + coorY + ": " + JSON.stringify(this.tile(coorY, coorX))})
  }*/

  componentWillMount () {
    this.setBoard()
    this.setFirstRoom(100, 20, 20)

  }
  componentDidMount () {
    this.setCharacters()
    this.setState({weapon: player.weapon, damage: player.damage, armor: player.armor,
      level: player.lvl, health: player.health, exp: player.exp})
    document.addEventListener("keydown", this.handleClick)
    audio.play()
    //this.enemyMove();   This is for the animated enemies idea. See the explaination below.
  }
  initialize () {
    rooms = [];
    placedRooms = [];
    enemyPool = [];
    healPool = [];
    armorPool = [];
    floorTiles = [];
    dark = true;
    active = false
    document.removeEventListener("keydown", this.handleClick)
    this.setBoard()
    this.setFirstRoom(100, 20, 20)
    setTimeout(() => {
      this.setCharacters();
      document.addEventListener("keydown", this.handleClick)
      active = true
    }, 50)
  }
  setCharacters () {
    var that = this
    var oldDamage = 0
    //    Character constructor function. It governs the whole information about the game entities.
    function Entity (charType, weapon, damage, health, armor, num, exp) {
      this.type = charType
      this.name = charType + num;
      this.weapon = weapon;
      this.damage = (Number(damage[0]) + Math.floor(exp/1000) * 10) + "-" + (Number(damage[2]) + Math.floor(exp/1000) * 10)
      this.health = health + Math.floor(exp/1000) * 10;
      this.armor = armor;
      this.exp = exp
      this.lvl = Math.floor(exp/1000)
      //   getTile is a helper method to simply get the current tile of the player character.
      this.getTile = function () {
        var playerLoc = []
        for (var i = 0; i < height; i++) {
          for (var j = 0; j < width; j++) {
            if (that.state.board[i][j].char !== null && that.state.board[i][j].char === player) {
              playerLoc.push(i, j)
              return playerLoc
            }
          }
        }
      };
      //   Move method of a character also determines the tile necessities like wheater it has an enemy or
      //   an item and properly calls the corresponding method.
      this.move = function (entity, status, direction) {
        that.setState({enemy: "None", enemyDamage: "None", enemyArmor: "None",
          enemyLevel: "None", enemyHealth: "None"
        })
        var currPosition = entity.getTile()
        switch (direction) {
          case "right":
          if (board[currPosition[0]][currPosition[1] + 1].status === "cells stairs") {
            that.setState({dungeonLevel: that.state.dungeonLevel + 1})
            that.initialize()
            return
          }
          if (board[currPosition[0]][currPosition[1] + 1].status === "cells enemy" || board[currPosition[0]][currPosition[1] + 1].status === "cells boss") {
            this.combat(board[currPosition[0]][currPosition[1] + 1], this.char)
          }
          if (board[currPosition[0]][currPosition[1] + 1].char !== null) {
            if (board[currPosition[0]][currPosition[1] + 1].char.type === "healing") {
              this.heal(entity, board[currPosition[0]][currPosition[1] + 1].char)
            } else if (board[currPosition[0]][currPosition[1] + 1].char.type === "defence") {
              this.deflect(entity, board[currPosition[0]][currPosition[1] + 1].char)
            } else if (board[currPosition[0]][currPosition[1] + 1].char.type === "weapon") {
              this.steel(entity, board[currPosition[0]][currPosition[1] + 1].char)
            }
          }
          if (board[currPosition[0]][currPosition[1] + 1].passable !== 0) {
            board[currPosition[0]][currPosition[1]].status = "cells " + board[currPosition[0]][currPosition[1]].tile_type
            board[currPosition[0]][currPosition[1]].char = null
            board[currPosition[0]][currPosition[1]].passable = 1

            board[currPosition[0]][currPosition[1] + 1].status = status
            board[currPosition[0]][currPosition[1] + 1].char = entity
            board[currPosition[0]][currPosition[1] + 1].passable = 0
          }
          break;
          case "left":
          if (board[currPosition[0]][currPosition[1] - 1].status === "cells stairs") {
            that.setState({dungeonLevel: that.state.dungeonLevel + 1})
            that.initialize()
            return
          }
          if (board[currPosition[0]][currPosition[1] - 1].status === "cells enemy" || board[currPosition[0]][currPosition[1] - 1].status === "cells boss") {
            this.combat(board[currPosition[0]][currPosition[1] - 1], this.char)
          }
          if (board[currPosition[0]][currPosition[1] - 1].char !== null) {
            if (board[currPosition[0]][currPosition[1] - 1].char.type === "healing") {
              this.heal(entity, board[currPosition[0]][currPosition[1] - 1].char)
            } else if (board[currPosition[0]][currPosition[1] - 1].char.type === "defence") {
              this.deflect(entity, board[currPosition[0]][currPosition[1] - 1].char)
            } else if (board[currPosition[0]][currPosition[1] - 1].char.type === "weapon") {
              this.steel(entity, board[currPosition[0]][currPosition[1] - 1].char)
            }
          }
          if (board[currPosition[0]][currPosition[1] - 1].passable !== 0) {
            board[currPosition[0]][currPosition[1]].status = "cells " + board[currPosition[0]][currPosition[1]].tile_type
            board[currPosition[0]][currPosition[1]].char = null
            board[currPosition[0]][currPosition[1]].passable = 1

            board[currPosition[0]][currPosition[1] - 1].status = status
            board[currPosition[0]][currPosition[1] - 1].char = entity
            board[currPosition[0]][currPosition[1] - 1].passable = 0
          }
          break;
          case "up":
          if (board[currPosition[0] - 1][currPosition[1]].status === "cells stairs") {
            that.setState({dungeonLevel: that.state.dungeonLevel + 1})
            that.initialize()
            return
          }
          if (board[currPosition[0] - 1][currPosition[1]].status === "cells enemy" || board[currPosition[0] - 1][currPosition[1]].status === "cells boss") {
            this.combat(board[currPosition[0] - 1][currPosition[1]], this.char)
          }
          if (board[currPosition[0] - 1][currPosition[1]].char !== null) {
            if (board[currPosition[0] - 1][currPosition[1]].char.type === "healing") {
              this.heal(entity, board[currPosition[0] - 1][currPosition[1]].char)
            } else if (board[currPosition[0] - 1][currPosition[1]].char.type === "defence") {
              this.deflect(entity, board[currPosition[0] - 1][currPosition[1]].char)
            } else if (board[currPosition[0] - 1][currPosition[1]].char.type === "weapon") {
              this.steel(entity, board[currPosition[0] - 1][currPosition[1]].char)
            }
          }
          if (board[currPosition[0] - 1][currPosition[1]].passable !== 0) {
            board[currPosition[0]][currPosition[1]].status = "cells " + board[currPosition[0]][currPosition[1]].tile_type
            board[currPosition[0]][currPosition[1]].char = null
            board[currPosition[0]][currPosition[1]].passable = 1

            board[currPosition[0] - 1][currPosition[1]].status = status
            board[currPosition[0] - 1][currPosition[1]].char = entity
            board[currPosition[0] - 1][currPosition[1]].passable = 0

          }
          break;
          case "down":
          if (board[currPosition[0] + 1][currPosition[1]].status === "cells stairs") {
            that.setState({dungeonLevel: that.state.dungeonLevel + 1})
            that.initialize()
            return
          }
          if (board[currPosition[0] + 1][currPosition[1]].status === "cells enemy" || board[currPosition[0] + 1][currPosition[1]].status === "cells boss") {
            this.combat(board[currPosition[0] + 1][currPosition[1]], this.char)
          }
          if (board[currPosition[0] + 1][currPosition[1]].char !== null) {
            if (board[currPosition[0] + 1][currPosition[1]].char.type === "healing") {
              this.heal(entity, board[currPosition[0] + 1][currPosition[1]].char)
            } else if (board[currPosition[0] + 1][currPosition[1]].char.type === "defence") {
              this.deflect(entity, board[currPosition[0] + 1][currPosition[1]].char)
            } else if (board[currPosition[0] + 1][currPosition[1]].char.type === "weapon") {
              this.steel(entity, board[currPosition[0] + 1][currPosition[1]].char)
            }
          }
          if (board[currPosition[0] + 1][currPosition[1]].passable !== 0) {
            board[currPosition[0]][currPosition[1]].status = "cells " + board[currPosition[0]][currPosition[1]].tile_type
            board[currPosition[0]][currPosition[1]].char = null
            board[currPosition[0]][currPosition[1]].passable = 1

            board[currPosition[0] + 1][currPosition[1]].status = status
            board[currPosition[0] + 1][currPosition[1]].char = entity
            board[currPosition[0] + 1][currPosition[1]].passable = 0
          }
          break;
          default:
            console.error("move method is called without any direction");
            break;
        }
        var newPosition = this.getTile()
        var sides = that.checkWeapons(newPosition[0], newPosition[1], board)
        if (sides === false && eventFlag === false) {
          that.setState({event: "You are walking in an unsavoury dungeon..."})
        } else if (eventFlag === false) {
          let weapon = (() => {
            if (sides === "North") {
              return board[newPosition[0]-1][newPosition[1]].char.brand
            } else if (sides === "South") {
              return board[newPosition[0]+1][newPosition[1]].char.brand
            } else if (sides === "West") {
              return board[newPosition[0]][newPosition[1]-1].char.brand
            } else if (sides === "East") {
              return board[newPosition[0]][newPosition[1]+1].char.brand
            }
          })()
          let damageW = (() => {
            if (sides === "North") {
              return board[newPosition[0]-1][newPosition[1]].char.damage
            } else if (sides === "South") {
              return board[newPosition[0]+1][newPosition[1]].char.damage
            } else if (sides === "West") {
              return board[newPosition[0]][newPosition[1]-1].char.damage
            } else if (sides === "East") {
              return board[newPosition[0]][newPosition[1]+1].char.damage
            }
          })()
          that.setState({
            event: "" + sides + " of you, there is a weapon called " + weapon + ", which has " + damageW + " damage!"
          })
        }
        eventFlag = false
      }; //end of move method
      this.combat = (combatant, entity) => {
        var oldLevel = this.lvl
        let currDamage = _.random(Number(this.damage.split("-")[0]), Number(this.damage.split("-")[1]))
        combatant.char.health = combatant.char.health - (currDamage - (currDamage
        * ((combatant.char.armor)/200)))
        if (combatant.char.armor > 0) {
          combatant.char.armor = combatant.char.armor - ((currDamage * 25) / 100)
          if (combatant.char.armor < 0) {
            combatant.char.armor = 0
          }
        }
        eventFlag = true
        that.setState({enemy: combatant.char.type === "enemy" ? "Warlock" : "The Necromencer", enemyDamage: combatant.char.damage, enemyArmor: Math.round(combatant.char.armor),
          enemyLevel: combatant.char.lvl, enemyHealth: Math.round(combatant.char.health), event: "You hit the Warlock, and he hit you back instantly! Ouch!"})
        //  check to see if the monster is dead
        if (combatant.char.health <= 0) {
          if (combatant.char.type === "boss") {
            that.youWon()
          }
          this.exp = this.exp + ((combatant.char.lvl + 1) * 100)
          this.lvl = Math.floor(this.exp/1000)
          if (oldLevel !== this.lvl) {
            let playerPos = this.getTile()
            that.setState({lvlAnim: true, lvlPosY: playerPos[0], lvlPosX: playerPos[1], level: this.lvl})
            setTimeout(()=>{that.setState({lvlAnim:false})},2000)
            this.damage = (Number(this.damage.split("-")[0]) + this.lvl * 3) + "-" + (Number(this.damage.split("-")[1]) + this.lvl * 3)
            if (this.health < 100) {
              this.health = 100
            }
            oldLevel = this.lvl
          }
          combatant.char = null
          combatant.status = "cells floor";
          combatant.passable = 1
          eventFlag = true
          that.setState({enemy: "None", enemyDamage: "None", enemyArmor: "None",
            enemyLevel: "None", enemyHealth: "None", event: "You slayed the monster!"})
        }
        //  if he's not dead, he hits back to us
        if (combatant.char !== null) {
          let enDamage = _.random(Number(combatant.char.damage.split("-")[0]), Number(combatant.char.damage.split("-")[1]))
          this.health = this.health - (enDamage - (enDamage
          * ((this.armor)/200)))
          if (this.armor > 0) {
            this.armor = this.armor - ((enDamage * 25) / 100)
            if (this.armor < 0) {
              this.armor = 0
            }
          }
        }
        if (this.health <= 0) {
          that.gameOver()
        }
      }
      this.heal = (entity, pos) => {
        entity.health += pos.healing
        pos = null
      }
      this.deflect = (entity, pos) => {
        if (entity.armor < 100) {
          entity.armor += pos.defence
          if (entity.armor > 100) {
            entity.armor = 100
          }
          pos = null
        }
      }
      this.steel = (entity, pos) => {
        entity.weapon = pos.brand
        entity.damage = (Number(entity.damage.split("-")[0]) + (pos.damage - oldDamage)) + "-" + (Number(entity.damage.split("-")[1]) + (pos.damage - oldDamage))
        oldDamage = pos.damage
        pos = null
      }
    }
    function Items (type, damage, defence, healing, num, brand) {
      this.type    = type
      this.name    = type + num
      this.damage  = damage;
      this.defence = defence;
      this.healing = healing;
      this.brand   = brand;
    }
    player = that.state.dungeonLevel === 1 ? new Entity("player", "Fists", "2-6", 100, 0, 0, 0) : player
    this.placeCharacters(Entity, Items)
  }

  gameOver() {
    this.setState({
      gameover: true,
      dungeonLevel: 1
    });
    document.removeEventListener("keydown", this.handleClick)
  }
  youWon () {
    this.setState({
      youwon: true,
      dungeonLevel: 1
    });
    document.removeEventListener("keydown", this.handleClick)
  }
  again() {
    this.initialize()
    setTimeout(() => {
    this.setState({
      weapon: player.weapon, damage: player.damage, armor: player.armor,
      level: player.lvl, health: player.health, exp: player.exp, gameover: false, youwon: false, enemy: "None", enemyDamage: "None", enemyArmor: "None",
      enemyLevel: "None", enemyHealth: "None", event: "You are walking in an unsavoury dungeon..."
    })
  },100)
  }

  placeCharacters (Chars, Goods) {
    var that = this
    for (let row = 1; row < height - 1; row++) {
      for (let col = 1; col < width - 1; col++) {
        if ((board[row + 1][col].status === "cells floor darkness" || board[row - 1][col].status === "cells floor darkness"
        ||  board[row][col + 1].status === "cells floor darkness" || board[row][col - 1].status === "cells floor darkness"
        ||  board[row + 1][col - 1].status === "cells floor darkness" || board[row - 1][col - 1].status === "cells floor darkness"
        ||  board[row - 1][col + 1].status === "cells floor darkness" || board[row + 1][col + 1].status === "cells floor darkness")
        &&  (board[row][col].status === "cells wall darkness" || board[row][col].status === "cells wall")) {
          board[row][col].tile_type = "rock"
          board[row][col].status = "cells rock darkness";
        }
      }
    }
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (board[row][col].tile_type === "floor") {
          floorTiles.push([row,col])
        }
      }
    }
    playerAdd();
    function playerAdd () {
      var startLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(startLocation, floorTiles) === true) {
        board[floorTiles[startLocation][0]][floorTiles[startLocation][1]].status = "cells player";
        board[floorTiles[startLocation][0]][floorTiles[startLocation][1]].char = player
        board[floorTiles[startLocation][0]][floorTiles[startLocation][1]].passable = 0
        $(".board").scrollTop(((board[floorTiles[startLocation][0]][floorTiles[startLocation][1]].y*20)/1.5))
      } else {playerAdd()}
    }
    enemy(0, that.state.dungeonLevel);
    function enemy(i = 0, lvl) {
      for (let c = i; c<20; c++) {
        var enemyLocation = _.random(0, floorTiles.length-1)
        if (that.checkTileAvailability(enemyLocation, floorTiles) === true) {
          enemyPool.push(new Chars("enemy", "Fists", "0-4", 100, (25*(lvl-1)), c, (lvl-1)*1000))
          board[floorTiles[enemyLocation][0]][floorTiles[enemyLocation][1]].status = "cells enemy darkness";
          board[floorTiles[enemyLocation][0]][floorTiles[enemyLocation][1]].char = enemyPool[c]
          board[floorTiles[enemyLocation][0]][floorTiles[enemyLocation][1]].passable = 0
        } else {enemy(c, that.state.dungeonLevel); break}
      }
    }
    healing(0, that.state.dungeonLevel);
    function healing (i = 0, lvl) {
      for (let c = i; c < 10; c++) {
        var healingLocation = _.random(0, floorTiles.length-1)
        if (that.checkTileAvailability(healingLocation, floorTiles) === true) {
          healPool.push(new Goods("healing", 0, 0, lvl*10, c, ""))
          board[floorTiles[healingLocation][0]][floorTiles[healingLocation][1]].status = "cells healing darkness";
          board[floorTiles[healingLocation][0]][floorTiles[healingLocation][1]].char = healPool[c]
        } else {healing(c, that.state.dungeonLevel); break}
      }
    }
    armor(0, that.state.dungeonLevel);
    function armor(i = 0, lvl) {
      for (let c = i; c < 5; c++) {
        var armorLocation = _.random(0, floorTiles.length-1)
        if (that.checkTileAvailability(armorLocation, floorTiles) === true) {
          armorPool.push(new Goods("defence", 0, lvl*10, 0, c, ""))
          board[floorTiles[armorLocation][0]][floorTiles[armorLocation][1]].status = "cells defence darkness";
          board[floorTiles[armorLocation][0]][floorTiles[armorLocation][1]].char = armorPool[c]
        } else {armor(c, that.state.dungeonLevel); break}
      }
    }
    if (this.state.dungeonLevel === 1) {
    mace()
    function mace() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
        var maceoftheBarbar = new Goods("weapon", 10, 0, 0, "", "Mace of the Barbar")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = maceoftheBarbar
      } else {mace()}
    }
    sword();
    function sword() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
        var bastardSword = new Goods("weapon", 15, 0, 0, "", "Bastard Sword")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = bastardSword
      } else {sword()}
    }
    }
    if (this.state.dungeonLevel === 2) {
    katana()
    function katana() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
      var hanzosKatana = new Goods("weapon", 20, 0, 0, "", "Hanzo's Katana")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = hanzosKatana
      } else {katana()}
    }
    hammer()
    function hammer() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
      var robertsHammer = new Goods("weapon", 25, 0, 0, "", "Robert's Hammer")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = robertsHammer
      } else {hammer()}
    }
    }
    if (this.state.dungeonLevel === 3) {
    ice()
    function ice() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
      var theIce = new Goods("weapon", 30, 0, 0, "", "The Ice")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = theIce
      } else {ice()}
    }
    anduril()
    function anduril() {
      let steelLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(steelLocation, floorTiles) === true) {
      var andur = new Goods("weapon", 35, 0, 0, "", "Anduril")
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].status = "cells weapon darkness";
        board[floorTiles[steelLocation][0]][floorTiles[steelLocation][1]].char = andur
      } else {anduril()}
    }
    boss()
    function boss() {
      var bossLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(bossLocation, floorTiles) === true) {
        var Necromencer = new Chars("boss", "Fists", "0-4", 150, 100, 0, 5000)
        board[floorTiles[bossLocation][0]][floorTiles[bossLocation][1]].status = "cells boss darkness";
        board[floorTiles[bossLocation][0]][floorTiles[bossLocation][1]].char = Necromencer
        board[floorTiles[bossLocation][0]][floorTiles[bossLocation][1]].passable = 0
        that.setState({bossLocationY: floorTiles[bossLocation][0], bossLocationX: floorTiles[bossLocation][1]})
      } else {boss()}
    }
    }
    if (this.state.dungeonLevel !== 3) {
    stairs();
    function stairs () {
      var stairsLocation = _.random(0, floorTiles.length-1)
      if (that.checkTileAvailability(stairsLocation, floorTiles, true) === true) {
        board[floorTiles[stairsLocation][0]][floorTiles[stairsLocation][1]].status = "cells stairs darkness";
        board[floorTiles[stairsLocation][0]][floorTiles[stairsLocation][1]].char = {type: "stairs"}
      } else {stairs()}
    }
    }
    let currPosition = player.getTile()
    this.darkness(currPosition[0], currPosition[1], board)
    this.setState({board: board})
  }

  checkTileAvailability (loc, tiles, stairs = false) {
    //  Special case for stairs tile as it needs not to block any doorway.
    if (stairs === true) {
      if ((board[tiles[loc][0]][tiles[loc][1]].char === null)
      && (board[tiles[loc][0]][tiles[loc][1] + 1].tile_type !== "door"
      ||  board[tiles[loc][0]][tiles[loc][1] - 1].tile_type !== "door"
      ||  board[tiles[loc][0] + 1][tiles[loc][1]].tile_type !== "door"
      ||  board[tiles[loc][0] - 1][tiles[loc][1]].tile_type !== "door")) {
        return true
      } else {
        return false
      }
    } else {
      if (board[tiles[loc][0]][tiles[loc][1]].char === null) {
        return true
      } else {
        return false
      }
    }
  }


//  NOTE: I originally thought about moving the monsters randomly. Maybe for some kind of turn-based gameplay.
//        But it turned out it can be annoying to catch a fight so i abandoned the idea.
  /*enemyMove() {
    var that = this
    function idleMoves () {
      var directions = ["right", "left", "up", "down"]
      for (let i = 0; i < enemyPool.length; i++) {
        var randomDir = _.random(0, directions.length)
        var enemy = enemyPool[i]
        enemyPool[i].move(enemy, "cells enemy", "enemy" + i, directions[randomDir])
      }
      anim = requestAnimationFrame(idleMoves)
      that.update()
    }
    requestAnimationFrame(idleMoves)
  }

  update () {
    this.setState({board: board})
  }*/

  handleClick(e) {
    var currPosition = player.getTile()
    //  FIXME: if i don't add the lines for removing and re-adding the event listener
    //         a serious lag happens when keeping the button pressed. setState enqueue
    //         can't catch up with the render. It could be CSS update or what. Please
    //         enlighten me on this subject.
    //  NOTE:  Turns out the problem is caused by local server environment of Node as far as i can tell.
    //         I tried to check the situation on Codepen and it macigally didn't lag. If you happen to
    //         know the issue that ruined my days, please let me know.
    //document.removeEventListener("keydown",this.handleClick)
    if (e.keyCode === 39) {
      player.move(player, "cells player", "right")
    } else if (e.keyCode === 37) {
      player.move(player, "cells player", "left")
    } else if (e.keyCode === 38) {
      player.move(player, "cells player", "up")
      $(".board").scrollTop((board[currPosition[0]][currPosition[1]].y*20)/1.5)
    } else if (e.keyCode === 40) {
      player.move(player, "cells player", "down")
      $(".board").scrollTop((board[currPosition[0]][currPosition[1]].y*20)/1.5)
    }

    if (dark && active) {
      let currPosition = player.getTile()
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          if (board[i][j].char !== null && board[i][j].char.type !== "player") {
            board[i][j].status = "cells " + board[i][j].char.type + " darkness"
          } else if (board[i][j].char === null) {
            board[i][j].status = "cells " + board[i][j].tile_type + " darkness"
          }
        }
      }
      this.darkness(currPosition[0], currPosition[1], this.state.board)
    }
    this.setState({board: board})

    this.setState({
      weapon: player.weapon, damage: player.damage, armor: Math.round(player.armor),
      level: player.lvl, health: Math.round(player.health), exp: player.exp
    })
    //see the comment above
    //setTimeout(() => {
      //document.addEventListener("keydown",this.handleClick)
    //})
  }
  //    This function handles darkness effect. It selects and changes classes of nearby player tiles
  //    so they became visible while the other tiles are dark.
  darkness(x, y, boardState){
    let topRow = x-1
    let bottomRow = x + 1
    let leftColumn = y-1
    let rightColumn = y+1
    for (let i = 0; i < 3; i++) {
      boardState[topRow][leftColumn-i].status
      = boardState[topRow][leftColumn-i].char === null ? "cells " + boardState[topRow][leftColumn-i].tile_type
      : "cells " + boardState[topRow][leftColumn-i].char.type
      boardState[topRow-i][leftColumn].status
      = boardState[topRow-i][leftColumn].char === null ? "cells " + boardState[topRow-i][leftColumn].tile_type
      : "cells " + boardState[topRow-i][leftColumn].char.type
      boardState[topRow-i][y].status
      = boardState[topRow-i][y].char === null ? "cells " + boardState[topRow-i][y].tile_type
      : "cells " + boardState[topRow-i][y].char.type
      boardState[topRow][rightColumn+i].status
      = boardState[topRow][rightColumn+i].char === null ? "cells " + boardState[topRow][rightColumn+i].tile_type
      : "cells " + boardState[topRow][rightColumn+i].char.type
      boardState[topRow-i][rightColumn].status
      = boardState[topRow-i][rightColumn].char === null ? "cells " + boardState[topRow-i][rightColumn].tile_type
      : "cells " + boardState[topRow-i][rightColumn].char.type
      boardState[x][leftColumn-i].status
      = boardState[x][leftColumn-i].char === null ? "cells " + boardState[x][leftColumn-i].tile_type
      : "cells " + boardState[x][leftColumn-i].char.type
      boardState[x][rightColumn+i].status
      = boardState[x][rightColumn+i].char === null ? "cells " + boardState[x][rightColumn+i].tile_type
      : "cells " + boardState[x][rightColumn+i].char.type
      boardState[bottomRow][leftColumn-i].status
      = boardState[bottomRow][leftColumn-i].char === null ? "cells " + boardState[bottomRow][leftColumn-i].tile_type
      : "cells " + boardState[bottomRow][leftColumn-i].char.type
      boardState[bottomRow+i][leftColumn].status
      = boardState[bottomRow+i][leftColumn].char === null ? "cells " + boardState[bottomRow+i][leftColumn].tile_type
      : "cells " + boardState[bottomRow+i][leftColumn].char.type
      boardState[bottomRow+i][y].status
      = boardState[bottomRow+i][y].char === null ? "cells " + boardState[bottomRow+i][y].tile_type
      : "cells " + boardState[bottomRow+i][y].char.type
      boardState[bottomRow+i][rightColumn].status
      = boardState[bottomRow+i][rightColumn].char === null ? "cells " + boardState[bottomRow+i][rightColumn].tile_type
      : "cells " + boardState[bottomRow+i][rightColumn].char.type
      boardState[bottomRow][rightColumn+i].status
      = boardState[bottomRow][rightColumn+i].char === null ? "cells " + boardState[bottomRow][rightColumn+i].tile_type
      : "cells " + boardState[bottomRow][rightColumn+i].char.type
    }
    for (let i = 0; i < 2; i++) {
      boardState[topRow-i][leftColumn-i].status
      = boardState[topRow-i][leftColumn-i].char === null ? "cells " + boardState[topRow-i][leftColumn-i].tile_type
      : "cells " + boardState[topRow-i][leftColumn-i].char.type
boardState[topRow-i][rightColumn+i].status
      = boardState[topRow-i][rightColumn+i].char === null ? "cells " + boardState[topRow-i][rightColumn+i].tile_type
      : "cells " + boardState[topRow-i][rightColumn+i].char.type
boardState[bottomRow+i][leftColumn-i].status
      = boardState[bottomRow+i][leftColumn-i].char === null ? "cells " + boardState[bottomRow+i][leftColumn-i].tile_type
      : "cells " + boardState[bottomRow+i][leftColumn-i].char.type
boardState[bottomRow+i][rightColumn+i].status
      = boardState[bottomRow+i][rightColumn+i].char === null ? "cells " + boardState[bottomRow+i][rightColumn+i].tile_type
      : "cells " + boardState[bottomRow+i][rightColumn+i].char.type
    }
  }

  //    This could come handy if i decided to go with the enemy motion. This would have a use on
  //    determining where to go for enemy AI. But at the end the idea is left out.
  checkWeapons(x, y, boardState){
    let topRow = x-1
    let bottomRow = x + 1
    let leftColumn = y-1
    let rightColumn = y+1
    if (boardState[topRow][y].char !== null && boardState[topRow][y].char.type === "weapon") {
      return "North"
    }
    if (boardState[bottomRow][y].char !== null && boardState[bottomRow][y].char.type === "weapon") {
      return "South"
    }
    if (boardState[x][leftColumn].char !== null && boardState[x][leftColumn].char.type === "weapon") {
      return "West"
    }
    if (boardState[x][rightColumn].char !== null && boardState[x][rightColumn].char.type === "weapon") {
      return "East"
    }
    return false
  }
  toggleDarkness () {
    var colY, colX
    for (var row of board) {
      for (var col of row) {
        if (dark) {
          if (col.status === "cells enemy darkness" || col.status === "cells enemy") {
            col.status = "cells enemy"
          } else if (col.status === "cells player") {
            col.status = "cells player"
          } else if (col.status === "cells healing darkness" || col.status === "cells healing") {
            col.status = "cells healing"
          } else if (col.status === "cells defence darkness" || col.status === "cells defence") {
            col.status = "cells defence"
          } else if (col.status === "cells weapon darkness" || col.status === "cells weapon") {
            col.status = "cells weapon"
          } else if (col.status === "cells stairs darkness" || col.status === "cells stairs") {
            col.status = "cells stairs"
          } else if (col.status === "cells boss darkness" || col.status === "cells boss") {
            col.status = "cells boss"
          } else {
            col.status = "cells " + col.tile_type
          }
          this.setState({board: board})
        } else {
          if (col.status === "cells enemy") {
            col.status = "cells enemy darkness"
          } else if (col.status === "cells player") {
            colY = col.y
            colX = col.x
          } else if (col.status === "cells healing") {
            col.status = "cells healing darkness"
          } else if (col.status === "cells defence") {
            col.status = "cells defence darkness"
          } else if (col.status === "cells weapon") {
            col.status = "cells weapon darkness"
          } else if (col.status === "cells stairs") {
            col.status = "cells stairs darkness"
          } else if (col.status === "cells boss") {
            col.status = "cells boss darkness"
          } else {
            col.status = "cells " + col.tile_type + " darkness"
          }
        }
      }
    }
    if (dark === false) {
      this.darkness(colY, colX, board)
      this.setState({board: board})
    }
    dark = !dark
  }

  render () {
    return(
      <div>
        <Board board={this.state.board} bossLocationY={this.state.bossLocationY}
          bossLocationX={this.state.bossLocationX} dungeonLevel={this.state.dungeonLevel}
          lvlAnim={this.state.lvlAnim} lvlPosY={this.state.lvlPosY} lvlPosX={this.state.lvlPosX} lvl={this.state.level}></Board>
        <PlayerInfo level={this.state.level} health={this.state.health} weapon={this.state.weapon}
          damage={this.state.damage} armor={this.state.armor} exp={this.state.exp}></PlayerInfo>
        <StoryTeller event={this.state.event} dungeon={this.state.dungeonLevel} toggle={this.toggleDarkness}></StoryTeller>
        <EnemyInfo enemy={this.state.enemy} level={this.state.enemyLevel} health={this.state.enemyHealth}
          damage={this.state.enemyDamage} armor={this.state.enemyArmor}></EnemyInfo>
        <Legend amount={this.state.dungeonLevel}></Legend>
        <GameOver gameover={this.state.gameover} again={this.again}></GameOver>
        <YouWon youwon={this.state.youwon} again={this.again}></YouWon>
      </div>
    )
  }
}

class Board extends Component {
  render () {
    var count = 0
    var boardMap = this.props.board.map((row, i) => {
      return (<Rows row={row} key={i} count={count++} y={i}></Rows>)
    })
    return (
      <div className="board">
        {boardMap}
        <LvlAnim lvlAnim={this.props.lvlAnim} lvlPosY={this.props.lvlPosY} lvlPosX={this.props.lvlPosX} lvl={this.props.lvl}></LvlAnim>
        <TheBoss board={this.props.board} bossLocationY={this.props.bossLocationY} bossLocationX={this.props.bossLocationX} dungeonLevel={this.props.dungeonLevel}></TheBoss>
      </div>
    )
  }
}
class Rows extends Component {
  render () {
    var boardCells = this.props.row.map((cell, i) => {
      return (<Cells key={i} x={cell.x} y={this.props.y} status={cell.status} count={i} char={cell.char}></Cells>)
    })
    return (
      <div className="rows" y={this.props.y}>
        {boardCells}
      </div>
    )
  }
}
class Cells extends Component {
  render () {
    return (
      <div className={this.props.status} id={this.props.y+" "+this.props.x} data-x={this.props.x} data-y={this.props.y} char={this.props.char}>

      </div>
    )
  }
}
/*class Query extends Component {
  render () {
    return (
      <div className="query">
        {this.props.info}
      </div>
    )
  }
}*/
class ToggleDark extends Component {
  render () {
    return (
      <Button className="toggleDark" bsSize="xsmall" onClick={this.props.toggle}>
        Toggle Darkness
      </Button>
    )
  }
}
class PlayerInfo extends Component {
  render () {
    return (
      <div className="playerinfo" style={{display: "inline-block", width: "10%", textAlign: "center",
        color: "white", height: "auto", lineHeight: 1.1, marginTop: ".5%", boxSizing: "border-box", fontSize: ".9vw"}}>
        &nbsp;&nbsp; <u><b>Player Info:</b></u>
        <p><span>Exp:</span>{this.props.exp}</p>
        <p><span>Level:</span>{this.props.level}</p>
        <p><span>Health:</span>{this.props.health}</p>
        <p><span>Weapon:</span>{this.props.weapon}</p>
        <p><span>Damage:</span>{this.props.damage}</p>
        <p><span>Armor:</span>{this.props.armor}</p>
      </div>
    )
  }
}
class EnemyInfo extends Component {
  render () {
    return (
      <div className="enemyinfo" style={{float: "right", display: "inline-block", width: "10%",
        height: "auto", textAlign: "center", color: "white", lineHeight: 1.5, marginTop: ".5%",
        boxSizing: "border-box", fontSize: ".9vw"}}>&nbsp;&nbsp; <u><b>Enemy Info:</b></u>
        <p><span>Enemy:</span>{this.props.enemy}</p>
        <p><span>Level:</span>{this.props.level}</p>
        <p><span>Health:</span>{this.props.health}</p>
        <p><span>Damage:</span>{this.props.damage}</p>
        <p><span>Armor:</span>{this.props.armor}</p>
      </div>
    )
  }
}
class StoryTeller extends Component {
  render () {
    return (
      <div className="events" style={{position: "absolute", display: "inline-block", color: "white",
         textAlign: "center", border: "0px solid white", width: "80%", marginTop: ".5%", lineHeight: 1}}>
        <p>Dungeon Level: {this.props.dungeon}</p>
        <p>Events: {this.props.event}</p>
        <ToggleDark toggle={this.props.toggle}></ToggleDark>
      </div>
    )
  }
}
class TheBoss extends Component {
  render () {
    return (
      <div>
      {this.props.dungeonLevel === 3 &&
      <img style={{top: this.props.bossLocationY * 20,
        left: this.props.bossLocationX * 20,
        width: 40, height: 40}}
        className={this.props.board[this.props.bossLocationY][this.props.bossLocationX].status === "cells boss" ? "necro" : "necro darkness" }
        src='theboss.gif' alt='theboss'>
      </img>
      }
      </div>
    )
  }
}
class LvlAnim extends Component {
  render () {
    return (
      <div>
        <p className={this.props.lvlAnim === true ? "lvlAnim" : "lvlNo"}
           style={{color: "white", position: "absolute", top: (this.props.lvlPosY-6)*20, left: (this.props.lvlPosX*20)-10}}>
           Level {this.props.lvl}!</p>
      </div>
    )
  }
}
class Legend extends Component {
  render () {
    return (
      <div className="legend" style={{position: "fixed", top: 5, left: 5, color: "white", opacity: .5, fontSize: ".7vw"}}>
        <p><img src="romanhelm.png" style={{width: 20, height: 20}} alt=""></img>: +{this.props.amount * 10} Armor</p>
        <p><img src="healing.jpg" style={{width: 20, height: 20}} alt=""></img>: +{this.props.amount * 10} Healing</p>
        <p><img src="bastardsword.png" style={{width: 20, height: 20}} alt=""></img>: Weapon</p>
        <p><img src="ladder.png" style={{width: 20, height: 20}} alt=""></img>: Stairs</p>
        <p><img src="warlock.png" style={{width: 20, height: 20}} alt=""></img>: Warlock</p>
        <p><img src="theboss.gif" style={{width: 20, height: 20}} alt=""></img>: The Necromencer</p>
      </div>
    )
  }
}
class GameOver extends Component {
  render () {
    return (
      <div>
      <div className={this.props.gameover === true ? "gameoverActive" : "gameoverPassive"} style={{position:"absolute", top:0, left:0, width:"100%", height:"100%",
      backgroundColor: "black"}}> <p className="endtext">YOU DIED!</p>
        <Button onClick={this.props.again} className="again">Enter the bloody dungeon again!</Button>
      </div>
      </div>
    )
  }
}
class YouWon extends Component {
  render () {
    return (
      <div>
      <div className={this.props.youwon === true ? "youwonactive" : "youwonpassive"} style={{position:"absolute", top:0, left:0, width:"100%", height:"100%",
      backgroundColor: "white"}}> <p className="endtext">All Hail the Warrior!</p>
        <Button onClick={this.props.again} className="again">Save the folk once more!</Button>
      </div>
      </div>
    )
  }
}
export default App;
