/*
 * Copyright (c) 2021-2024 SigScalr, Inc.
 *
 * This file is part of SigLens Observability Solution
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

let eGridDiv = null;
//eslint-disable-next-line no-unused-vars
function renderMeasuresGrid(columnOrder, hits) {
    if (eGridDiv === null) {
        eGridDiv = document.querySelector('#measureAggGrid');
        //eslint-disable-next-line no-undef
        new agGrid.Grid(eGridDiv, aggGridOptions);
    }
    // set the column headers from the data
    let colDefs = aggGridOptions.api.getColumnDefs();
    colDefs.length = 0;
    colDefs = columnOrder.map((colName, index) => {
        let title = colName;
        let resize = index + 1 == columnOrder.length ? false : true;
        let maxWidth = Math.max(displayTextWidth(colName, 'italic 19pt  DINpro '), 200); //200 is approx width of 1trillion number
        //preserving white space for every column
        let cellRenderer = (params) => {
            const span = document.createElement('span');
            span.style.whiteSpace = 'pre';
            span.textContent = params.value;
            return span;
        };
        return {
            field: title,
            headerName: title,
            resizable: resize,
            minWidth: maxWidth,
            cellRenderer: cellRenderer,
        };
    });
    aggsColumnDefs = _.chain(aggsColumnDefs).concat(colDefs).uniqBy('field').value();
    aggGridOptions.api.setColumnDefs(aggsColumnDefs);
    let newRow = new Map();
    $.each(hits.measure, function (_key, resMap) {
        newRow.set('id', 0);
        columnOrder.map((colName, _index) => {
            let ind = -1;
            if (hits.groupByCols != undefined && hits.groupByCols.length > 0) {
                ind = findColumnIndex(hits.groupByCols, colName);
            }
            //group by col
            if (ind != -1 && resMap.GroupByValues.length != 1 && resMap.GroupByValues[ind] != '*') {
                newRow.set(colName, resMap.GroupByValues[ind]);
            } else if (ind != -1 && resMap.GroupByValues.length === 1 && resMap.GroupByValues[0] != '*') {
                newRow.set(colName, resMap.GroupByValues[0]);
            } else {
                // Check if MeasureVal is undefined or null and set it to 0
                if (resMap.MeasureVal[colName] === undefined || resMap.MeasureVal[colName] === null) {
                    newRow.set(colName, '0');
                } else {
                    newRow.set(colName, resMap.MeasureVal[colName]);
                }
            }
        });
        segStatsRowData = _.concat(segStatsRowData, Object.fromEntries(newRow));
    });
    aggGridOptions.api.setRowData(segStatsRowData);
}

function displayTextWidth(text, font) {
    let canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement('canvas'));
    let context = canvas.getContext('2d');
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}
