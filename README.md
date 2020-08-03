# procupine-db

使用localstorage作为存储介质的，语法类sql前台数据库

## 现有的功能

<table>
    <tr>
        <th>sql语法</th>
        <th>js语法</th>
    </tr>
    <tr>
        <td>
            CREATE TABLE table_name
            (
            column_name1 data_type(size),
            column_name2 data_type(size),
            column_name3 data_type(size),
            ....
            );
        </td>
        <td>
            db.create.table('table').run();
        </td>
    </tr>
    <tr>
        <td>
            INSERT INTO table_name
            VALUES (value1,value2,value3,...);
        </td>
        <td>
        db.insert.into('table').value([
            {
                name: 'yzh3',
                age: 123
            },{
                name: 'yzh4',
                age: 123
            }
        ]).run();
        </td>
    </tr>
    <tr>
        <td>
            UPDATE table_name
            SET column1=value1,column2=value2,...
            WHERE some_column=some_value;
        </td>
        <td>
            db.select().from('table').where(function(item) {
    			return item.name === 'yzh';
    		}).run();
        </td>
    </tr>
    <tr>
        <td>
            DELETE FROM table_name
            WHERE some_column=some_value;
        </td>
        <td>
            db.delete.from('table').where(function(item) {
                return item.name === 'yzh';
            }).run();
        </td>
    </tr>
    <tr>
        <td>
            SELECT column_name,column_name
            FROM table_name
            WHERE column_name operator value;
        </td>
        <td>
            db.select().from('table').where(function(item) {
                return item.name === 'yzh';
            }).run();
        </td>
    </tr>
</table>

## 使用

所有语句最后跟 `.run()` 才会执行

### 实例化

```JavaScript

var db = new Pdb;

```

### 新建表

```JavaScript

db.create.table('table').run();

```

### 在表中插入数据

#### 单条数据

```JavaScript

db.insert.into('table').value({
    name: 'yzh3',
    age: 123
}).run();

```

#### 多条数据

```JavaScript

db.insert.into('table').value([
    {
        name: 'yzh3',
        age: 123
    },{
        name: 'yzh4',
        age: 123
    }
]).run();

```

### 更新数据

#### 更新表中符合某条件的数据

```JavaScript

db.update('table').set({
	age: 312
}).where(function(item) {
	return item.name === 'yzh'
}).run();

```

#### 更新表中全部数据

```JavaScript

db.update('table').set({
	age: 666
}).run();

```

### 删除数据

#### 删除表中符合某条件的数据

```JavaScript

db.delete.from('table').where(function(item) {
	return item.name === 'yzh';
}).run();

```

#### 删除表中全部数据

```JavaScript

db.delete.from('table');

```

### 筛选数据

#### 筛选表中符合某条件的数据

```JavaScript

db.select().from('table').where(function(item) {
	return item.name === 'yzh';
}).run();

```

#### 筛选表中全部数据

```JavaScript

db.select().from().run();

```

#### 筛选表中数据的某些字段

```JavaScript

db.select('name', 'age').from('table').where(function(item) {
	return item.name === 'yzh';
}).run();

```

或

```JavaScript

db.select(['name', age]).from('table').where(function(item) {
	return item.name === 'yzh';
}).run();

```

#### 内连接查询

```JavaScript

var rows = db.select().from('table').inner.join('table2').on(function(left, right) {
    return left.name === right.name
}).run();

```

使用 select 及 where

```JavaScript

var rows = db.select([
    'score',
    'name',
    'age'
]).from('table').inner.join('table2').on(function(left, right) {
    return left.name === right.name
}).where(function(row) {
    return row.name === 'yzh';
}).run();

```
