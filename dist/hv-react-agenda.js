var HvReactAgenda =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var moment    = __webpack_require__(1);
	var React     = __webpack_require__(2);
	var PropTypes = React.PropTypes;
	var _         = __webpack_require__(3);

	var DEFAULT_ITEM = {
	  name     : '',
	  classes  : '',
	  cellRefs : []
	};

	var HvReactAgenda = React.createClass({displayName: "HvReactAgenda",

	  propTypes: {
	    locale          : PropTypes.string.isRequired,
	    startDate       : PropTypes.instanceOf(Date),
	    startAtTime     : PropTypes.number.isRequired,
	    rowsPerHour     : PropTypes.oneOf([1,2,3,4]).isRequired,
	    numberOfDays    : PropTypes.oneOf([1,2,3,4,5,6,7]).isRequired,
	    items           : PropTypes.arrayOf(PropTypes.shape({
	      name          : PropTypes.string,
	      startDateTime : PropTypes.instanceOf(Date).isRequired,
	      endDateTime   : PropTypes.instanceOf(Date).isRequired,
	      classes       : PropTypes.string
	    })),
	    onItemSelect    : PropTypes.func
	  },

	  getDefaultProps: function() {
	    return {
	      locale       : 'en',
	      startAtTime  : 8,
	      rowsPerHour  : 4,
	      numberOfDays : 5
	    }
	  },

	  getInitialState: function() {
	    return {
	      date              : moment(),
	      items             : {},
	      itemOverlayStyles : {},
	      highlightedCells  : [],
	      focusedCell       : null
	    }
	  },

	  componentWillMount: function() {
	    if (this.props.startDate) {
	      this.setState({date: moment(this.props.startDate)});
	    }

	    if (this.props.items) {
	      this.setState({items: this.mapItems(this.props.items)});
	    }
	  },

	  componentDidMount: function() {
	    // move to start time (this only happens once)
	    var scrollContainer = this.refs.agendaScrollContainer.getDOMNode();
	    var rowToScrollTo   = this.refs["hour-" + this.props.startAtTime].getDOMNode();
	    scrollContainer.scrollTop = rowToScrollTo.offsetTop;
	  },

	  componentWillReceiveProps: function() {
	    if (this.props.items) {
	      this.setState({items: this.mapItems(this.props.items)});
	    }

	    if (this.props.startDate) {
	      this.setState({date: this.props.startDate});
	    }
	  },

	  nextRange: function() {
	    this.setState({date: this.state.date.add(this.props.numberOfDays, 'days')});
	  },

	  prevRange: function() {
	    this.setState({date: this.state.date.subtract(this.props.numberOfDays, 'days')});
	  },

	  mapItems: function(itemsArray) {
	    var itemsMap = {};
	    itemsArray.forEach(function(item) {
	      var interval      = (60/this.props.rowsPerHour);
	      var offsetMinutes = item.startDateTime.getMinutes() % interval;
	      var start         = moment(item.startDateTime).subtract(offsetMinutes, "minutes").toDate();
	      var end           = item.endDateTime;
	      var duration      = moment.duration(moment(end).diff(moment(start)));
	      var rows          = Math.ceil(duration.asHours()/(interval/60));

	      var cellRefs = [];
	      for (var i = 0; i < rows; i++) {
	        var ref = moment(start).add(i*interval, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
	        cellRefs.push(ref);
	      }

	      cellRefs.forEach(function(ref) {
	        var newItem = _.omit(item, 'classes');
	        newItem.classes  = (itemsMap[ref]) ? (itemsMap[ref].classes + ' ' + item.classes) : (item.classes || '');
	        newItem.cellRefs = cellRefs;
	        itemsMap[ref] = newItem;
	      });
	    }, this);

	    return itemsMap;
	  },

	  getHeaderColumns: function() {
	    var cols = [];
	    for (var i = 0; i < this.props.numberOfDays; i++) {
	      cols.push(moment(this.state.date).add(i, 'days').toDate());
	    }
	    return cols;
	  },

	  getBodyRows: function() {
	    var rows = [];
	    var interval = (60/this.props.rowsPerHour);
	    for (var i = 0; i < 24*this.props.rowsPerHour; i++) {
	      rows.push(moment(this.state.date).startOf('day').add(Math.floor(i*interval), 'minutes'));
	    }
	    return rows;
	  },

	  getMinuteCells: function(rowMoment) {
	    var cells = [];
	    for (var i = 0; i < this.props.numberOfDays; i++) {
	      var cellRef = moment(rowMoment).add(i, 'days').format('YYYY-MM-DDTHH:mm:ss');
	      cells.push({
	        cellRef: cellRef,
	        item: this.state.items[cellRef] || DEFAULT_ITEM
	      });
	    }
	    return cells;
	  },

	  getItemOverlayStyle: function(cellRef) {
	    if (this.state.focusedCell === cellRef && _.contains(this.state.highlightedCells, cellRef)) {
	      var firstCell   = this.refs[_.first(this.state.highlightedCells)].getDOMNode();
	      var lastCell    = this.refs[_.last(this.state.highlightedCells)].getDOMNode();

	      var firstCellY  = firstCell.offsetTop - firstCell.scrollTop + firstCell.clientTop;
	      var lastCellY   = lastCell.offsetTop - lastCell.scrollTop + lastCell.clientTop;

	      return {
	        display: 'block',
	        zIndex: 1,
	        position: 'absolute',
	        width: firstCell.offsetWidth,
	        textAlign: 'center',
	        top: firstCell.offsetTop + ((lastCellY-firstCellY)/2)
	      };
	    } else {
	      return {
	        display: 'none'
	      };
	    }
	  },

	  handleMouseEnter: function(cell) {
	    if (cell.item) {
	      this.setState({focusedCell: cell.cellRef});
	      this.setState({highlightedCells: cell.item.cellRefs});
	    }
	  },

	  handleMouseLeave: function(cell) {
	    this.setState({focusedCell: null});
	    this.setState({highlightedCells: []});
	  },

	  handleMouseClick: function(cell) {
	    if (this.props.onItemSelect && cell.item.startDateTime) {
	      this.props.onItemSelect(_.omit(cell.item, 'cellRefs'));
	    }
	  },

	  render: function() {

	    var renderHeaderColumns = function(col, i) {
	      var headerLabel = moment(col);
	      headerLabel.locale(this.props.locale);
	      return (
	        React.createElement("th", {ref: "column-" + (i+1), key: "col-" + i, className: "agenda__cell --head"}, 
	          headerLabel.format('ddd M\/D')
	        )
	      );
	    };

	    var renderBodyRows = function(row, i) {
	      if (i % this.props.rowsPerHour === 0) {
	        var ref = "hour-" + Math.floor(i/this.props.rowsPerHour);
	        var timeLabel = moment(row);
	        timeLabel.locale(this.props.locale);
	        return (
	          React.createElement("tr", {key: "row-" + i, ref: ref, className: "agenda__row --hour-start"}, 
	            React.createElement("td", {className: "agenda__cell --time", rowSpan: this.props.rowsPerHour}, timeLabel.format('LT')), 
	            this.getMinuteCells(row).map(renderMinuteCells, this)
	          )
	        );
	      } else {
	        return (
	          React.createElement("tr", {key: "row-" + i}, 
	            this.getMinuteCells(row).map(renderMinuteCells, this)
	          )
	        );
	      }
	    };

	    var renderMinuteCells = function(cell, i) {
	      var cellClasses = {
	        'agenda__cell'      : true,
	        '--hovered'         : _.contains(this.state.highlightedCells, cell.cellRef),
	        '--hovered-first'   : _.contains(this.state.highlightedCells, cell.cellRef) && (_.first(this.state.highlightedCells) === cell.cellRef),
	        '--hovered-last'    : _.contains(this.state.highlightedCells, cell.cellRef) && (_.last(this.state.highlightedCells)  === cell.cellRef)
	      };
	      cellClasses[cell.item.classes] = true;

	      var classSet = React.addons.classSet(cellClasses);

	      return (
	        React.createElement("td", {
	          ref: cell.cellRef, 
	          key: "cell-" + i, 
	          onMouseEnter: this.handleMouseEnter.bind(this, cell), 
	          onMouseLeave: this.handleMouseLeave.bind(this, cell), 
	          onClick: this.handleMouseClick.bind(this, cell), 
	          className: classSet
	        }, 
	          React.createElement("div", {
	            style: this.getItemOverlayStyle(cell.cellRef), 
	            className: "agenda__item-overlay-title"}, 
	              cell.item.name
	          )
	        )
	      );
	    };

	    return (
	      React.createElement("div", {className: "agenda"}, 
	        React.createElement("div", {className: "agenda__table --header"}, 
	          React.createElement("table", null, 
	            React.createElement("thead", null, 
	              React.createElement("tr", null, 
	                React.createElement("th", {ref: "column-0", className: "agenda__cell --controls"}, 
	                  React.createElement("div", {className: "agenda__prev", onClick: this.prevRange}, React.createElement("span", null, "«")), 
	                  React.createElement("div", {className: "agenda__next", onClick: this.nextRange}, React.createElement("span", null, "»"))
	                ), 
	                this.getHeaderColumns().map(renderHeaderColumns, this)
	              )
	            )
	          )
	        ), 
	        React.createElement("div", {ref: "agendaScrollContainer", className: "agenda__table --body", style: {position:'relative'}}, 
	          React.createElement("table", null, 
	            React.createElement("tbody", null, 
	              this.getBodyRows().map(renderBodyRows, this)
	            )
	          )
	        )
	      )
	    );
	  }

	});

	module.exports = HvReactAgenda;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = moment;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = React;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = _;

/***/ }
/******/ ])