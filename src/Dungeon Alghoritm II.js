import React, { Component } from 'react';
import './App.css';
import $ from "jquery";
import './index.js';
var _ = require('lodash');
var Well = require('react-bootstrap/lib/Well');
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup')
var PageHeader = require('react-bootstrap/lib/PageHeader');

var width = 130;
var height = 70;
var board = [];
var rooms = [];
var placedRooms = [];
var count = 0;
var track = 0;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [],
      info: ""
    }
    this.tileQuery = this.tileQuery.bind(this)
  }
  setBoard(bool = false) {
    var Y = 0;
    for (var i=0; i < height; i++) {
      board[i] = new Array(width)
    }
    for (var k = 0 ; k < height; k++) {
      for (var z = 0; z < width; z++) {
        board[k][z] = {id: z, status: "cells wall", x:z, y:Y, passable: 0, tile_type: "wall", char: null}
      }
      Y++
    }
    this.setState({board: board})
  }
  tile (y, x) {
    return board[y][x]
  }
  room (y,x,h,w,stat,type) {
    this.y = y;
    this.x = x;
    this.h = h;
    this.w = w;
    for (var i = y; i<h+y; i++) {
      for (var j = x; j<w+x; j++) {
        this.tile(i,j).status = stat
        this.tile(i,j).tile_type = type
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
      this.room(seed[0].y, seed[0].x, seed[0].height, seed[0].width, "cells floor", "floor")
      count++
      this.setRooms (seed, maxRooms, maxHeight, maxWidth)
    } else if (count === 0){
      return
    }
  }
  setRooms(array, maxRooms, maxHeight, maxWidth) {
    rooms = array.slice()
    var roomW = rooms[rooms.length-1].width, roomH = rooms[rooms.length-1].height, roomX = rooms[rooms.length-1].x, roomY = rooms[rooms.length-1].y

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
        return _.random(west.y, Math.min(west.y+west.height, roomY+roomH))
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
        return _.random(east.y, Math.min(east.y+east.height, roomY+roomH))
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
        return _.random(north.x, Math.min(north.x+north.width, roomX+roomW))
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
        return _.random(south.x, Math.min(south.x+south.width, roomX+roomW))
      }
    }()
    south.doorY = roomY + roomH
    //south.direction = "S"
    rooms.push(south)

    rooms.forEach((room) => {
      if (this.isAvailableforRoom(room.y, room.x, room.height, room.width) && count < maxRooms) {
        this.room(room.y, room.x, room.height, room.width, "cells floor", "floor")
        this.room(room.doorY, room.doorX, 1, 1, "cells door", "door")
        placedRooms.push(room)
        count++
      }
    })
    if (count < maxRooms) {
      track++
      if (track < 1000) {
        this.setRooms(placedRooms, maxRooms, 20, 20)
      } else {
        return
      }
    }
  }

  isAvailableforRoom (top, left, bottom, right) {
    for (var row = top; row<top+bottom; row++) {
      for (var col = left; col<left+right; col++) {
        if (top+bottom > height - 1 || left+right > width - 1 || top < 1 || left < 1) {
          return false
        }
        if ((this.tile(row, col).status === "cells wall floor" || this.tile(row+1, col).status === "cells wall floor"
        || this.tile(row-1, col).status === "cells wall floor" || this.tile(row, col+1).status === "cells wall floor"
        || this.tile(row, col-1).status === "cells wall floor")) {
          return false
        }
        if (right < 4 || bottom < 4) {
          return false
        }
      }
    }
    return true
  }

  tileQuery (e) {
    var coorX = e.target.dataset.x
    var coorY = e.target.dataset.y
    this.setState({info: "X, Y: " + JSON.stringify(this.tile(coorY, coorX))})
  }

  componentWillMount () {
    this.setBoard()
    this.setFirstRoom(50, 20, 20)
  }

  //setCharacters () {

  //}

  /*countLiveNeighbors(x, y, boardState){
    let topRow = x-1
    let bottomRow = x + 1
    let leftColumn = y-1
    let rightColumn = y+1

    let total = 0;
    total += boardState[topRow][leftColumn].status === "cells door" ? 1 : 0;
    total += boardState[topRow][y].status === "cells door" ? 1 : 0;
    total += boardState[topRow][rightColumn].status === "cells door" ? 1 : 0;
    total += boardState[x][leftColumn].status === "cells door" ? 1 : 0;
    total += boardState[x][rightColumn].status === "cells door" ? 1 : 0;
    total += boardState[bottomRow][leftColumn].status === "cells door" ? 1 : 0;
    total += boardState[bottomRow][y].status === "cells door" ? 1 : 0;
    total += boardState[bottomRow][rightColumn].status === "cells door" ? 1 : 0;
    return total
  }
*/

  render () {
    return(
      <div>
        <Board board={this.state.board} query={this.tileQuery}></Board>
        <Query info={this.state.info}></Query>
      </div>
    )
  }
}


class Board extends Component {
  render () {
    var count = 0
    var boardMap = this.props.board.map((row, i) => {
      return (<Rows row={row} key={i} count={count++} y={i} query={this.props.query}></Rows>)
    })
    return (
      <div className="board">
        {boardMap}
      </div>
    )
  }
}
class Rows extends Component {
  render () {
    var boardCells = this.props.row.map((cell, i) => {
      return (<Cells key={i} x={cell.x} y={this.props.y} status={cell.status} count={i} query={this.props.query}></Cells>)
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
      <div className={this.props.status} data-x={this.props.x} data-y={this.props.y} onMouseOver={this.props.query}>

      </div>
    )
  }
}
class Query extends Component {
  render () {
    return (
      <div className="query">
        {this.props.info}
      </div>
    )
  }
}
export default App;
