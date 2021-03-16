class Plot{
    constructor(svgElemIn, carsDataIn, classIdxAssignIn){
        this.svgElem = svgElemIn;
        this.carsData = carsDataIn;
        this.classIdxAssign = classIdxAssignIn;
    }

    draw(){
        // margins and padding
        let margin = 50;
        let padding = 15;

        // color scheme - from https://www.d3-graph-gallery.com/graph/custom_color.html
        var myColor = d3.scaleOrdinal()
                        .domain(this.carsData)
                        .range(["gold", "blue", "darkgreen", "yellow", "red", "grey", "green", "pink", "brown", "slateblue", "grey1", "orange"])

        // get the extent of the data (PCA values)
        let extentX = d3.extent(this.carsData, function(d){
            return d.pcaX;
        })

        let extextY = d3.extent(this.carsData, function(d){
            return d.pcaY;
        })

        var xScale = d3.scaleLinear()
            .domain(extentX)
            .range([30 + margin,1000 - margin])
        
        var yScale = d3.scaleLinear()
            .domain(extextY)
            .range([500 - margin, 0 + margin])


        let svgPlot = d3.select('#plotSVG')
        svgPlot.selectAll('circle').remove();

        svgPlot.selectAll('circle')
            .data(this.carsData)
            .enter()
            .append('circle')
            .attr('cx',function(d){
                return xScale(d.pcaX);
            })
            .attr('cy',function(d){
                return yScale(d.pcaY);
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
            .style("fill", function(d){
                return myColor(d.class)
            })
            .classed('centroid', function(d){
                if(d.isCent == 1){return true;}
                else{return false;}
            })
            .on("mousemove",function (mouseData,d){
                // adjust tooltip x offset so tooltip appears in visible area
                let xOffset = -150;
                if(mouseData.clientX < 500){
                    xOffset = 10;
                }
                console.log(mouseData);
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

        // Axises
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat("")
            
        svgPlot.append('g')
            .attr('transform','translate(0,' + (500 - margin) + ")")
            .attr('class', 'axis')
            .call(xAxis);

        var yAxis = d3.axisLeft()
            .scale(yScale)
            .tickFormat("")
            
        svgPlot.append('g')
            .attr('transform','translate(' + (margin + padding * 2) + ',0)')
            .attr('class', 'axis')
            .call(yAxis);

        //title
        svgPlot.append("text")
            .attr("x", (1000 / 2))             
            .attr("y", 0 + (margin / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Vehicle Classification: k-Means Clustering with PCA to 2 dimensions");
        
        // legend - colors
        svgPlot.selectAll('.legendGrp').remove();
        let legGrp = svgPlot.append('g');
        legGrp.classed('legendGrp', true)
        legGrp.attr('transform', 'translate(700,50)');
        let legSVG = legGrp.append('svg')

        legSVG.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width',250)
            .attr('height', d => {
                return (this.classIdxAssign.length + 2) * 20;
            })
            .attr('stroke', 'black')
            .attr('fill', 'none')
            
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
            .attr('fill', function(d,i){
                return myColor(i)
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