// class for filtering, clustering and dimensionality of data
class DataProcessing{
    constructor(data, numClasses){
        this.carsData = data;           // the cars data
        this.NUMOFCLASSES = numClasses; // number classes for kMeans
        this.classIdxAssign = null;     // array of arrays of kMeans results
        this.clusterData = null;        // data for druidjs
        this.CENTROIDS = null;          // kMeans class centers
    }

    // performs filter, clustering and dimensionality reduction
    processData(){
        // filter out cars with missing values
        this._filterData();

        // create array of arrays for druidjs
        this._transformToArray();
        
        // perform kMeans clustering
        this._performClustering();
        
        // perform PCA
        this._performPCA();
        
    }

    // fill out cars that do not have complete set of values
    _filterData(){
        // filter Nan's out of data
        this.carsData = this.carsData.filter(function (elem){
            if(!isNaN(parseFloat(elem.Horsepower)) 
                && !isNaN(parseFloat(elem.Displacement)) 
                && !isNaN(parseFloat(elem.MPG))){
                    return elem;
                }
            }) 
    }

    // transform data from array of JSON objects to array of arrays
    // druidjs expects arrays of arrays
    _transformToArray(){
        // select the 3 features to perform clustering on
        // used in clustering and PCA reduction
        this.clusterData = this.carsData.map(function(elem){
            return [
                parseFloat(elem.Displacement),
                parseFloat(elem.Horsepower),
                parseFloat(elem.MPG)
            ]
        })
    }

    // perfomrs clustering using druidjs library
    _performClustering(){
        // create druidjs matrix from data
        let matrix = druid.Matrix.from(this.clusterData);

        // perform k-Means clustering
        let kMeans = new druid.KMeans(matrix, this.NUMOFCLASSES);
        this.classIdxAssign = kMeans.get_clusters();
        this.CENTROIDS = kMeans._cluster_centroids;

        // add classification to carsData 
        for(let i = 0; i < this.NUMOFCLASSES; i++){
            for(let j = 0; j < this.classIdxAssign[i].length; j++){

                this.carsData[this.classIdxAssign[i][j]].class = i;
                this.carsData[this.classIdxAssign[i][j]].isCent = 0;
            }
        }

        // add centroids to cluster and cars data for pca and plotting
        for(let i = 0; i < this.CENTROIDS.length; i++){
            this.carsData.push({
                class: i,
                isCent: 1,
                Model: "Class " + i,
                Displacement: Math.round(this.CENTROIDS[i][0]).toString(),
                Horsepower: Math.round(this.CENTROIDS[i][1]).toString(),
                MPG: Math.round(this.CENTROIDS[i][2]).toString()
            })
            this.clusterData.push([
                this.CENTROIDS[i][0],
                this.CENTROIDS[i][1],
                this.CENTROIDS[i][2]
            ])
        }
    }

    // performs PCA dimensionality reduction
    _performPCA(){
        // pca - for data (including Cluster Centroids)
        let matrix2 = druid.Matrix.from(this.clusterData); // new matrix that includes centroids
        let pca = new druid.PCA(matrix2,2);
        let resultPCA = pca.transform().to2dArray;

        // add to cars data
        for(let i = 0; i < resultPCA.length; i++){
            this.carsData[i].pcaX = resultPCA[i][0];
            this.carsData[i].pcaY = resultPCA[i][1];
        }
    }

    _processData(){
        // filter out cars with missing values
        this.filterData();

        // create array of arrays for druidjs
        this.transformToArray();
        
        // perform kMeans clustering
        this.performClustering();
        
        // perform PCA
        this.performPCA();
        
    }
}