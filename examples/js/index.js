var outerHTML = '\
<table>{{tableBody}}</table>\
';

function renderTable(arr) {
    var tableContent = '';
    
    function loopRows(arr) {
        var tableContent = '';
        arr.forEach(function(row, index) {
            var rowHTML = '<tr>{{tds}}</tr>'
    
            var tds = '';
    
            Object.keys(row).forEach(function(key) {
                tds += ('<td>' + row[key] +'</td>');
            });
    
            rowHTML = rowHTML.replace('{{tds}}', tds);
    
            tableContent += rowHTML;
        });

        return tableContent;
    }

    function getHeader(arr) {
        if(!arr[0]) return '';

        var tableContent = '';
        
        var rowHTML = '<tr>{{tds}}</tr>'
    
        var tds = '';

        Object.keys(arr[0]).forEach(function(key) {
            tds += ('<th>' + key +'</th>');
        });

        rowHTML = rowHTML.replace('{{tds}}', tds);

        tableContent += rowHTML;

        return tableContent;
    }

    tableContent = getHeader(arr);
    tableContent += loopRows(arr);

    return outerHTML.replace('{{tableBody}}', tableContent);
};