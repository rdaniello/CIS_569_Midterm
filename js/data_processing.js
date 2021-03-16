class DataProcessing{
    constructor(data, numClasses){
        this.carsData = data;       // the cars data
        this.NUMOFCLASSES = numClasses;      // number classes for kMeans
        this.classIdxAssign = null; // array of arrays of kMeans results
    }

    processData(){
        let CENTROIDS = null;  //class Centroids

        // filter Nan's out of data
        this.carsData = this.carsData.filter(function (elem){
            if(!isNaN(parseFloat(elem.Horsepower)) 
                && !isNaN(parseFloat(elem.Displacement)) 
                && !isNaN(parseFloat(elem.MPG))){
                    return elem;
                }
            }) 

        // select the 3 features to perform clustering on
        // used in clustering and PCA reduction
        let clusterData = this.carsData.map(function(elem){
            return [
                parseFloat(elem.Displacement),
                parseFloat(elem.Horsepower),
                parseFloat(elem.MPG)
            ]
        }) 
        
        // create druidjs matrix from data
        let matrix = druid.Matrix.from(clusterData);

        // perform k-Means clustering
        let kMeans = new druid.KMeans(matrix, this.NUMOFCLASSES);
        this.classIdxAssign = kMeans.get_clusters();
        CENTROIDS = kMeans._cluster_centroids;

        // add classification to carsData and is data point flag
        for(let i = 0; i < this.NUMOFCLASSES; i++){
            for(let j = 0; j < this.classIdxAssign[i].length; j++){

                this.carsData[this.classIdxAssign[i][j]].class = i;
                this.carsData[this.classIdxAssign[i][j]].isCent = 0;
            }
        }

        // add centroids to cluster and cars data for pca and plotting
        for(let i = 0; i < CENTROIDS.length; i++){
            this.carsData.push({
                class: i,
                isCent: 1,
                Model: "Class " + i,
                Displacement: Math.round(CENTROIDS[i][0]).toString(),
                Horsepower: Math.round(CENTROIDS[i][1]).toString(),
                MPG: Math.round(CENTROIDS[i][2]).toString()
            })
            clusterData.push([
                CENTROIDS[i][0],
                CENTROIDS[i][1],
                CENTROIDS[i][2]
            ])
        }

        // pca - for data (including Cluster Centroids)
        let matrix2 = druid.Matrix.from(clusterData); // new matrix that includes centroids
        let pca = new druid.PCA(matrix2,2);
        let resultPCA = pca.transform().to2dArray;

        // add to cars data
        for(let i = 0; i < resultPCA.length; i++){
            this.carsData[i].pcaX = resultPCA[i][0];
            this.carsData[i].pcaY = resultPCA[i][1];
        }
    }
}