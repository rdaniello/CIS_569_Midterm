// class for drawing scatter plot of processed data
class Plot{
    constructor(svgElemIn, carsDataIn, classIdxAssignIn){
        this.svgElem = svgElemIn;
        this.carsData = carsDataIn;
        this.classIdxAssign = classIdxAssignIn;
        this.colorScale = null;
        
        // margins and padding
        this.margin = 50;
        this.padding = 15;

        // x and y scales
        this.xScale = null;
        this.yScale = null;
    }

    // draws the entire plot
    drawPlot(){
        // set the x and y scales from the data
        this._setScales();

        //set color scale
        this._setColorScale();

        // draw the data points
        this._drawPoints();
        
        // add the axises
        this._drawAxises();

        // add the title and legend
        this._drawTitleLegend();
    }

    _setScales(){
        // get the extent of the data (PCA values)
        let extentX = d3.extent(this.carsData, function(d){
            return d.pcaX;
        })

        let extextY = d3.extent(this.carsData, function(d){
            return d.pcaY;
        })

        this.xScale = d3.scaleLinear()
            .domain(extentX)
            .range([30 + this.margin,1000 - this.margin])
        
        this.yScale = d3.scaleLinear()
            .domain(extextY)
            .range([500 - this.margin, 0 + this.margin])
    }

    _setColorScale(){
        // color scheme - from https://www.d3-graph-gallery.com/graph/custom_color.html
        this.colorScale = d3.scaleOrdinal()
                        .domain(this.carsData)
                        .range(["gold", "blue", "darkgreen", "yellow", "red", "grey", "green", "pink", "brown", "slateblue", "grey1", "orange"])
    }

    // draw data points on plot
    _drawPoints(){
        let svgPlot = d3.select('#plotSVG')
        svgPlot.selectAll('circle').remove();

        svgPlot.selectAll('circle')
            .data(this.carsData)
            .enter()
            .append('circle')
            .attr('cx', d=>{
                return this.xScale(d.pcaX);
            })
            .attr('cy',d=>{
                return this.yScale(d.pcaY);
            })
            .attr('r', function(d){
                // if centroid draw larger circle
                if(d.isCent == 1){
                    return 7;
                }
                else{
                    return 3;
                }
            })
            .style("fill", d =>{
                return this.colorScale(d.class);
            })
            .classed('centroid', function(d){
                if(d.isCent == 1){return true;}
                else{return false;}
            })
            // define mouseover/tooltip callbacks
            .on("mousemove",function (mouseData,d){
                // adjust tooltip x offset so tooltip appears in visible area
                let xOffset = -150;
                if(mouseData.clientX < 500){
                    xOffset = 10;
                }
                d3.selectAll('.tooltip').remove();
                d3.select('body')
                    .append("div")
                    .classed('tooltip',true)
                    .style("left",(mouseData.x + xOffset).toString() +"px")
                    .style("top",(mouseData.y + 10).toString()+"px")
                    .html(
                        "<div class='tooltipData'>Model: "+ d.Model+"</div>" +
                        "<div class='tooltipData'>Class: "+d.class+"</div>" +
                        "<div class='tooltipData'>MPG: "+d.MPG+"</div>" +
                        "<div class='tooltipData'>Displacement: "+d.Displacement+"</div>" +
                        "<div class='tooltipData'>HorsePower: "+d.Horsepower+"</div>" 
                    )
            })
            .on("mouseleave",function (mouseData,d){
                d3.selectAll('.tooltip').remove();
            })
    }

    // add x and y axis to plot
    _drawAxises(){
        // Axises
        var xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickFormat("")
            
        svgPlot.append('g')
            .attr('transform','translate(0,' + (500 - this.margin) + ")")
            .attr('class', 'axis')
            .call(xAxis);

        var yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickFormat("")
            
        svgPlot.append('g')
            .attr('transform','translate(' + (this.margin + this.padding * 2) + ',0)')
            .attr('class', 'axis')
            .call(yAxis);

        //title
        svgPlot.append("text")
            .attr("x", (1000 / 2))             
            .attr("y", 0 + (this.margin / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Vehicle Classification: k-Means Clustering with PCA to 2 dimensions");
    }

    _drawTitleLegend(){
        // add legend group
        svgPlot.selectAll('.legendGrp').remove();
        let legGrp = svgPlot.append('g');
        legGrp.classed('legendGrp', true)
        legGrp.attr('transform', 'translate(700,50)');
        let legSVG = legGrp.append('svg')

        // legend border
        legSVG.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width',250)
            .attr('height', d => {
                return (this.classIdxAssign.length + 2) * 20;
            })
            .attr('stroke', 'black')
            .attr('fill', 'none')
            
        // legend color blocks
        legSVG.selectAll('.legendRect')
            .data(this.classIdxAssign)
            .enter()
            .append('rect')
            .classed('.legendRect', true)
            .attr('x', 2)
            .attr('y', function(d,i){
                return (i * 20) + 2;
            })
            .attr('width',20)
            .attr('height', 15)
            .attr('fill', (d,i)=>{
                return this.colorScale(i)
            })
        
        // legend labels - with # in each class
        legSVG.selectAll('.legendLabel')
            .data(this.classIdxAssign)
            .enter()
            .append('text')
            .classed('.legendLabel', true)
            .attr('x', 25)
            .attr('y', function(d,i){
                return (i * 20) + 2 ;
            })
            .style("font-size", "12px") 
            .style("dominant-baseline","hanging")
            .text(function(d,i){
                return "Class: " + i + ' - '  + d.length + ' cars ';
            });
        
        // legend notes
        legSVG.append('text')
            .attr('x', 0)
            .attr('y', d =>{
                return (this.classIdxAssign.length * 20) ;
            })
            .style("font-size", "10px") 
            .style("dominant-baseline","hanging")
            .text('NOTE: Class centroids are larger and outlined in black');

        legSVG.append('text')
            .attr('x', 0)
            .attr('y', d=>{
                return ((this.classIdxAssign.length + 1) * 20) ;
            })
            .style("font-size", "10px") 
            .style("dominant-baseline","hanging")
            .text('NOTE: Columns used: Displacement, Horsepower, MPG');
    }
}