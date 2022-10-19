// https://observablehq.com/@justlemonsong/progettone-turismo-grafici-e-visualizzazioni@385
import define1 from "/@jashkenas/inputs.js?v=3&resolutions=fc214340e64aea19@385";

function _1(md){return(
md`# Progettone Turismo: grafici e visualizzazioni`
)}

function _2(md){return(
md`### Horizontal Bar Chart Plotly`
)}

function _bar(DOM,Plotly)
{
  const data0 = [{
  type: 'bar',
  x: [0.440, 0.067, 0.060, 0.045, 0.024, 0.016, 0.011, 0.010],
  y: ["Firenze", "Pisa", "Siena", "Lucca", "s. Gimignano", "Livorno", "Portoferraio", "Arezzo"],
  orientation: 'h',
  }];
  
  var layout =  {
   title: 'Le 8 città più visitate della Toscana.',
  yaxis: {autorange: "reversed"},
  barmode: 'stack'
  };
  
   const div = DOM.element('div');
   Plotly.newPlot(div, data0, layout);
   return div; 
}


function _4(md){return(
md`### Radar Chart Plotly`
)}

function _radarData(FileAttachment){return(
FileAttachment("radar_list_norm-1.txt").json()
)}

function _radar(radarData,DOM,Plotly)
{
  const data = radarData.map(d => ({
    type: 'scatterpolar',
    r: d.dati.map(s => s.value).concat(d.dati.map(s => s.value)[0]), // .concat(...) serve per copiare il primo valore della serie in fondo all'array. Serve per chiudere la line
    theta: d.dati.map(s => s.axis).concat(d.dati.map(s => s.axis)[0]),
    // fill: 'toself', // crea il riempimento
    name: d.nome,
    visible: d.nome == "Toscana" ? true : 'legendonly',
    opacity: 0.5,
    line: {
      width: 2,
      shape: 'spline' // questo crea uno smooth delle linee
      // color: 'red' // qui potete passare una funzione per assegnare colori personalizzati
    },
    marker: {
      size: 8
    },
    // un template html per formattare il box visibile al passggio del mouse
    hovertemplate: '<b>%{theta}</b>' + '<br>%{r:.2f}<br>' + "<extra></extra>"
  }));

  const layout = {
    //width: width,
    //height: (width / 3) * 2,
    polar: {
      angularaxis: {
        linewidth: 1,
        color: 'gray',
        showline: false
      },
      radialaxis: {
        gridcolor: 'white',
        gridwidth: 2,
        visible: true,
        range: [0, 1.05], // il range dell'asse [min,max]
        color: 'gray',
        showline: false
      },
      bgcolor: 'rgb(245,245,245)' // colore di sfondo
    }
  };

  const div = DOM.element('div');
  Plotly.newPlot(div, data, layout);
  return div;
}


function _7(md){return(
md`## Sankey with filter and d3`
)}

function _8(md){return(
md`#### Data import for Sankey`
)}

function _dd1(select,d3,input){return(
select({
  title: "Dimmi da dove vieni e ti dirò dove vai.",
  description: "Scegli la città che preferisci.",
  options: d3.map(input, function(d){return d.provincia;}).keys(),
  value: "Pisa"
})
)}

function _edgeColor(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value="input" selected>Color by input</option>
  <option value="output">Color by output</option>
  <option value="path">Color by input-output</option>
  <option value="none">No color</option>
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("color") || "input"
})
)}

function _chart(d3,width,height_s,sankey,data_s,color,edgeColor,DOM)
{
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height_s]);

  const {nodes, links} = sankey(data_s);

  svg.append('g')
      .attr('stroke', '#000')
    .selectAll('rect')
    .data(nodes)
    .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', color)
    .on('mouseover', showConnection)
    .on('mouseout', hideConnection)
    .append('title')
      .text(d => d.name);

  const link = svg.append('g')
      .attr('fill', 'none')
    .selectAll('g')
    .data(links)
    .join('g');
  
  if (edgeColor === 'path') {
    const gradient = link.append('linearGradient')
      .attr('id', d => (d.uid = DOM.uid('link')).id)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => color(d.source));

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => color(d.target));
  }

  link.append('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke', d => edgeColor === 'none' ? '#aaa'
      : edgeColor === 'path' ? d.uid 
      : edgeColor === 'input' ? color(d.source) 
      : color(d.target))
    .attr('stroke-width', '1px');

  link.append('title')
    .text(d => `${d.source.name} → ${d.target.name}`);

  svg
    .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
    .selectAll('text')
    .data(nodes)
    .join('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name)
    .clone(true).lower()
      .attr('stroke', 'white');

  function showConnection(d) {
    const linkedNodes = [];
    
    var traverse = [{
      linkType : 'sourceLinks',
      nodeType : 'target',
    }, {
      linkType : 'targetLinks',
      nodeType : 'source',
    }];
    
    traverse.forEach((step) => {
      d[step.linkType].forEach((l) => {
        linkedNodes.push(l[step.nodeType]);
      });
    });
    
    // Update linked nodes style
    d3.selectAll('rect').style(
      'opacity',
      r => linkedNodes.find(remainingNode => remainingNode.name === r.name) ? '1' : '0.5'
    );
    
    // Update hovered node style
    d3.select(this).style('opacity', '1');
    
    // Update links style
    d3.selectAll('path').style(
      'opacity',
      p => (p && (p.source.name === d.name || p.target.name === d.name)) ? '1' : '0.5'
    );
    d3.selectAll('path').attr(
      'stroke-width',
      p => (p && (p.source.name === d.name || p.target.name === d.name)) ? '4px' : '1px'
    );
  }
  
  function hideConnection() {
    // Update nodes style
    d3.selectAll('rect').style('opacity', '1');
    
    // Update links style
    d3.selectAll('path').style('opacity', '1');
    d3.selectAll('path').attr('stroke-width', '1px');
  }
  
  return svg.node();
}


function _sankey(d3,width,height_s)
{
  const sankey = d3.sankey()
    .nodeId(d => d.name)
    .nodeWidth(10)
    .nodePadding(10)
    .extent([[1, 5], [width - 1, height_s - 5]]);
  return ({nodes, links}) => sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });
}


function _color(d3)
{
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  return d => color(d.name);
}


function _input(d3,sankey_csv){return(
d3.csv(sankey_csv, d3.autoType)
)}

function _data_s(Fdata)
{
  const links = Fdata;
  const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({name}));
  
  return {nodes, links};
}


function _Fdata(input,dd1){return(
input.filter(d => d.provincia === dd1)
)}

function _sankey_csv(){return(
'https://raw.githubusercontent.com/gpachera/gian_public/master/sankey_pr_3.csv'
)}

function _width_s(){return(
954
)}

function _height_s(){return(
600
)}

function _20(md){return(
md`## TreeMap - Tableau`
)}

function _21(md){return(
md`https://eu-west-1a.online.tableau.com/t/gianlucasperduti/views/definitivo-TreeMap/Sheet1?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link`
)}

function _22(md){return(
md`## Flourish - Hub vs destinazioni nascoste`
)}

function _23(md){return(
md`https://public.flourish.studio/visualisation/3054941/`
)}

function _24(md){return(
md`## Leaflet Heatmap with D3`
)}

function _data_l(d3){return(
d3.csv(
  'https://raw.githubusercontent.com/gpachera/gian_public/master/csv_leaflet.csv'
)
)}

function _fdata_l(data_l){return(
data_l.filter(d => d['n_reviews']!=0)
)}

function _normalize(d3,fdata_l){return(
d3
  .scaleLinear()
  .domain([0, d3.max(fdata_l.map(d => d['n_reviews']))])
  .range([0, 100])
)}

function _choleraPoints(fdata_l,normalize){return(
fdata_l.map(d => {
  return [
    +d['lat'],
    +d['long'],
    +normalize(d['n_reviews'])
  ];
})
)}

function _29(d3,fdata_l){return(
d3.extent(fdata_l.map(d => +d['lat']))
)}

function _xCenter(d3,fdata_l){return(
d3.mean(d3.extent(fdata_l.map(d => +d['lat'])))
)}

function _yCenter(d3,fdata_l){return(
d3.mean(d3.extent(fdata_l.map(d => +d['long'])))
)}

function* _heat(DOM,L,heatLayer,choleraPoints)
{
  // You'll often see Leaflet examples initializing a map like L.map('map'),
  // which tells the library to look for a div with the id 'map' on the page.
  // In Observable, we instead create a div from scratch in this cell, so it's
  // completely self-contained.
let container = DOM.element('div', {
   style: `width:100%px;height:400px`,
    gestureHandling: true
  });

  // Note that I'm yielding the container pretty early here: this allows the
  // div to be placed on the page. This is important, because Leaflet uses
  // the div's .offsetWidth and .offsetHeight to size the map. If I were
  // to only return the container at the end of this method, Leaflet might
  // get the wrong idea about the map's size.
  yield container;

  // Now we create a map object and add a layer to it.‎43,7874; 11,2499
  let map = L.map(container).setView([43.7874, 11.2499], 9);
  let osmLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }
  ).addTo(map);

  let choleraLayer = heatLayer(choleraPoints).addTo(map);
}


function _33(md){return(
md`### Import`
)}

function _34(html,resolve){return(
html`<link href='${resolve(
  'leaflet@1.2.0/dist/leaflet.css'
)}' rel='stylesheet' />`
)}

function _L(require){return(
require('leaflet@1.2.0')
)}

function _heatLayer(L,require){return(
L, require('leaflet.heat').catch(() => L.heatLayer)
)}

function _d3(require){return(
require("d3@5", "d3-sankey@0.12")
)}

function _Plotly(require){return(
require("https://cdn.plot.ly/plotly-latest.min.js")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["radar_list_norm-1.txt", {url: "https://static.observableusercontent.com/files/472295acef61942cc30f3c5cc1ed8a774dad09f32058d1eb19b7749f20b8d77fed133e492abe3d3c2b7830ae4faf948d822ed5cef7d847f821562140c665e570", mimeType: "text/plain", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("bar")).define("bar", ["DOM","Plotly"], _bar);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("radarData")).define("radarData", ["FileAttachment"], _radarData);
  main.variable(observer("radar")).define("radar", ["radarData","DOM","Plotly"], _radar);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("viewof dd1")).define("viewof dd1", ["select","d3","input"], _dd1);
  main.variable(observer("dd1")).define("dd1", ["Generators", "viewof dd1"], (G, _) => G.input(_));
  main.variable(observer("viewof edgeColor")).define("viewof edgeColor", ["html","URLSearchParams"], _edgeColor);
  main.variable(observer("edgeColor")).define("edgeColor", ["Generators", "viewof edgeColor"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","width","height_s","sankey","data_s","color","edgeColor","DOM"], _chart);
  main.variable(observer("sankey")).define("sankey", ["d3","width","height_s"], _sankey);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("input")).define("input", ["d3","sankey_csv"], _input);
  main.variable(observer("data_s")).define("data_s", ["Fdata"], _data_s);
  main.variable(observer("Fdata")).define("Fdata", ["input","dd1"], _Fdata);
  main.variable(observer("sankey_csv")).define("sankey_csv", _sankey_csv);
  main.variable(observer("width_s")).define("width_s", _width_s);
  main.variable(observer("height_s")).define("height_s", _height_s);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer()).define(["md"], _21);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer("data_l")).define("data_l", ["d3"], _data_l);
  main.variable(observer("fdata_l")).define("fdata_l", ["data_l"], _fdata_l);
  main.variable(observer("normalize")).define("normalize", ["d3","fdata_l"], _normalize);
  main.variable(observer("choleraPoints")).define("choleraPoints", ["fdata_l","normalize"], _choleraPoints);
  main.variable(observer()).define(["d3","fdata_l"], _29);
  main.variable(observer("xCenter")).define("xCenter", ["d3","fdata_l"], _xCenter);
  main.variable(observer("yCenter")).define("yCenter", ["d3","fdata_l"], _yCenter);
  main.variable(observer("heat")).define("heat", ["DOM","L","heatLayer","choleraPoints"], _heat);
  main.variable(observer()).define(["md"], _33);
  main.variable(observer()).define(["html","resolve"], _34);
  main.variable(observer("L")).define("L", ["require"], _L);
  main.variable(observer("heatLayer")).define("heatLayer", ["L","require"], _heatLayer);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("Plotly")).define("Plotly", ["require"], _Plotly);
  return main;
}