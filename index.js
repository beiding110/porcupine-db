(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Pdb = factory());
}(this, function () {
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
    * 获取变量类型
    * @param  {All} obj 待获取类型的变量
    * @return {String}     变量类型
    */
    function getType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };

    /**
     * 设置storage基方法
     * @param  {string} type sessionStorage或localStorage
     * @param  {string} key  要取的key
     * @return {string|Object}      对应存储的数据
     */
    function getStorage(type, key) {
        var res = !!key ?
            window[type][key] ?
            ((/{|}|%7B|%7D|\[|\]|%5B|%5D/.test(window[type][key]) ?
                JSON.parse(unescape(window[type][key])) :
                unescape(window[type][key]))) : undefined :
            window[type];
        return res || false;
    };
    /**
     * 获取storage基方法
     * @param {string} type  sessionStorage或localStorage
     * @param {string|object} key   要设置的key或整个对象
     * @param {Object} value 已设置的结果
     */
    function setStorage(type, key, value) {
        if (typeof key === 'string') {
            window[type][key] = (typeof value === 'object') 
                ? escape(JSON.stringify(value)) 
                : escape(value);
        } else if (typeof key === 'object') {
            Object.keys(key).forEach(function (item) {
                window[type][item] = (typeof value === 'object') 
                    ? escape(JSON.stringify(key[item])) 
                    : escape(key[item]);
            });
        };
        return window[type];
    };

    /**
     * 获取localStorage里的数据
     * @param  {string} key 待获取的key
     * @return {string|Object} 取回的值
     */
    function getLocal (key) {
        return getStorage('localStorage', key);
    };

    /**
     * 将值存入localStorage
     * @param  {string|Object} key   待存值的key或json对象
     * @param  {string|object} value 待存值的value
     * @return {object}       存入后localStorage对象
     */
    function setLocal (key, value) {
        return setStorage('localStorage', key, value);
    };

    /**
     * 获取sessionStorage里的数据
     * @param  {string} key 待获取的key
     * @return {string|Object} 取回的值
     */
    function getSession (key) {
        return getStorage('sessionStorage', key);
    };

    /**
     * 将值存入sessionStorage
     * @param  {string|Object} key   待存值的key或json对象
     * @param  {string|object} value 待存值的value
     * @return {object}       存入后sessionStorage对象
     */
    function setSession (key, value) {
        return setStorage('sessionStorage', key, value);
    };

    function rowguid() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        };
        return guid;
    }

    function Pdb() {
        this.init();
    };

    var _pointer;
    Pdb.prototype = {
        init: function() {
            console.log(
                '%c porcupine-data-base',
                'background:#35495e; border-radius:3px; color:#fff'
            );
            
            _pointer = this;

            this.pathReset();
            
            this.$ram = {
                dataBase: getLocal(),
                history: [],
                _current_action_rows: [],
                _current_action_table: [],
                _current_action_table_name: []
            };
        },
        getRam: function(type, key) {
            var ramItem = _pointer.$ram[type][key];

            var res = !!key ?
            ramItem ?
            ((/{|}|%7B|%7D|\[|\]|%5B|%5D/.test(ramItem) ?
                JSON.parse(unescape(ramItem)) :
                unescape(ramItem))) : undefined :
                _pointer.$ram[type];
            return res || false;
        },
        setRam: function(type, key, value) {
            if (typeof key === 'string') {
                _pointer.$ram[type][key] = (typeof value === 'object') 
                    ? escape(JSON.stringify(value)) 
                    : escape(value);
            } else if (typeof key === 'object') {
                Object.keys(key).forEach(function (item) {
                    _pointer.$ram[type][item] = (typeof value === 'object') 
                        ? escape(JSON.stringify(key[item])) 
                        : escape(key[item]);
                });
            };

            setLocal(key, value);
            return _pointer.$ram[type];
        },

        pathReset: function() {
            _pointer._path = [];
        },
        link: function(obj) {
            _pointer._path.push(obj);
        },

        create: {
            table: function(table) {
                var linkItem = {
                    sql: ('CREATE TABLE ' + table),
                    priority: 0,
                    handler: function(cb) {
                        _pointer.$ram._current_action_table_name = table;
                        _pointer.$ram._current_action_table = _pointer.getRam('dataBase', table);
                        if(_pointer.$ram._current_action_table) {
                            console.warn('已存在该名称的table：' + table);
                            return false;
                        };
    
                        _pointer.setRam('dataBase', table, []);
                        cb && cb();
                        return true;
                    }
                };
                _pointer.link(linkItem);
                return _pointer;
            }
        },

        insert: {
            into: function(table) {
                var that = this,
                    linkItem = {
                    sql: ('INSERT INTO ' + table),
                    priority: 1,
                    handler: function(cb) {
                        _pointer.$ram._current_action_table_name = table;
                        _pointer.$ram._current_action_table = _pointer.getRam('dataBase', table);

                        if(!_pointer.$ram._current_action_table) {
                            console.warn('找不到该table：' + table);
                            return false;
                        };
    
                        _pointer.$ram._current_action_table.push.apply(_pointer.$ram._current_action_table, _pointer.$ram._current_action_rows);

                        _pointer.setRam('dataBase', table, _pointer.$ram._current_action_table);
                        cb && cb();
                        return true;
                    }
                };
                _pointer.link(linkItem);
                return this;
            },
            value: function(obj) {
                var that = this,
                    linkItem = {
                    sql: ('VALUE ' + JSON.stringify(obj)),
                    priority: 0,
                    handler: function(cb) {
                        if(getType(obj) === 'array') {
                            obj.forEach(function(item) {
                                item.rowguid = rowguid();
                            });
                            _pointer.$ram._current_action_rows = obj;
                        } else if(getType(obj) === 'object') {
                            obj.rowguid = rowguid();
                            _pointer.$ram._current_action_rows = [obj];
                        };
                        cb();
                    }
                };
                _pointer.link(linkItem);
                return _pointer;
            }
        },

        delete: {
            from: function(table) {
                var that = this,
                    linkItem = {
                    sql: ('DELETE'),
                    priority: 2,
                    handler: function(cb) {
                        var arrToDelIndex = [];
                        var selectedRows = _pointer.$ram._current_action_rows;
                        selectedRows.forEach(function(row) {
                            var index = _pointer.$ram._current_action_table.indexOf(row);
                            arrToDelIndex.push(index);
                        });

                        arrToDelIndex = arrToDelIndex.reverse();
                        arrToDelIndex.forEach(function(index) {
                            _pointer.$ram._current_action_table.splice(index, 1);
                        })
                        
                        _pointer.setRam('dataBase', table, _pointer.$ram._current_action_table);
                        cb();
                    }
                };
                _pointer.link(linkItem);

                _pointer.from.call(_pointer, table);

                return _pointer;
            }
        },

        update: function(table) {
            _pointer.from.call(_pointer, table);

            return _pointer;
        },
        set: function(obj) {
            var that = this,
            linkItem = {
                sql: ('DELETE'),
                priority: 2,
                handler: function(cb) {
                    var selectedRows = _pointer.$ram._current_action_rows;
                    selectedRows.forEach(function(row) {
                        var index = _pointer.$ram._current_action_table.indexOf(row);
                        var rowClone = clone(_pointer.$ram._current_action_table[index]);

                        Object.keys(obj).forEach(function(key) {
                            rowClone[key] = obj[key];
                        });

                        _pointer.$ram._current_action_table.splice(index, 1, rowClone);
                    });
                    
                    _pointer.setRam('dataBase', _pointer.$ram._current_action_table_name, _pointer.$ram._current_action_table);
                    cb();
                }
            };
            _pointer.link(linkItem);

            return _pointer;
        },

        select: function() {
            var args = []

            if(getType(arguments[0]) === 'array') {
                args.push.apply(args, arguments[0]);
            } else if (getType(arguments[0]) === 'string') {
                args.push.apply(args, arguments);
            };

            var linkItem = {
                sql: ('SELECT'),
                priority: 2,
                handler: function(cb) {
                    if(!args.length) {
                        return cb();
                    };

                    _pointer.$ram._current_action_rows = _pointer.$ram._current_action_rows.map(function(item) {
                        var mapObj = {};
                        args.forEach(function(key) {
                            mapObj[key] = item[key];
                        });
                        return mapObj;
                    });
                }
            };
            _pointer.link(linkItem);
            
            return _pointer;
        },
        from: function(table) {
            var linkItem = {
                sql: ('FROM ' + table),
                priority: 0,
                handler: function(cb) {
                    _pointer.$ram._current_action_table_name = table;
                    _pointer.$ram._current_action_table = _pointer.getRam('dataBase', table);
                    _pointer.$ram._current_action_rows = _pointer.$ram._current_action_table;
                    cb();
                }
            };
            _pointer.link(linkItem);
            return _pointer;
        },
        where: function(filter) {
            if(getType(filter) !== 'function') {
                throw new Error('where语句参数应为函数');
            };

            var filterStr = filter.toString();
            filterStr = filterStr.replace(/\s+/g, '');
            filterStr = filterStr.slice(filterStr.indexOf('return') + 6, filterStr.indexOf(';') ? -2 : -1);

            var linkItem = {
                sql: ('WHERE ' + filterStr),
                priority: 1,
                handler: function(cb) {
                    _pointer.$ram._current_action_rows = _pointer.$ram._current_action_table.filter(filter);
                    cb();
                }
            };
            _pointer.link(linkItem);
            return _pointer;
        },
        run: function() {
            var index = 0,
                sql_text = '';

            sql_text = _pointer._path.map(function(item) {
                return item.sql;
            }).join(' ');

            _pointer._path.sort(function(a, b) {
                return a.priority - b.priority;
            });

            console.log(_pointer._path);

            var loop = function() {
                var this_node = _pointer._path[index];
                index ++;
                if(this_node && getType(this_node.handler) === 'function') {
                    return this_node.handler(loop);
                };
            };

            loop();

            _pointer.$ram.history.push('数据库执行成功：' + sql_text);
            _pointer.pathReset();

            return _pointer.$ram._current_action_rows;
        }
    };

    return Pdb;
}));
