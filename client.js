let io = require("socket.io-client");
const { PythonShell } = require("python-shell");
const {WriteToFile,ReadFromFile} = require("./helper")
const {SERVER_URL} = require("./constants")
// connect to server
let socket = io.connect(SERVER_URL, {
  reconnection: true,
});

socket.on("connect", () => {

  // receive global model
  socket.on("global_model_config", (data) => {
    // saving the global model
    try {
      WriteToFile("model_config.json", JSON.stringify(data.model_config));
      console.log("Received Model config...")
      console.log("Waiting to start training...\n")
    }
    catch(err) {
      console.log(err)
    }
  });

  // receive weights for training
  socket.on("start_train", (data) => {
    // saving the weights of global model
    console.log("\nSelected for Training")
    try {
      WriteToFile("model_weights.txt",data.model_weights)
      .then(() => {
         console.log("starting training...");
          PythonShell.run("client.py",{ scriptPath: ""},(err) => {
            console.log("Training Complete")
             if (!err) {
               try {
                 ReadFromFile("model_weights_updated.txt").then((data) => {
                  socket.emit("weight_update", { model_weights : data});
                  console.log("Weight updates sent\n");
                 });
               } catch (err) {
                 console.log(err);
               }
             } else console.log(err);
           }
         );
      })
    } 
    catch(err) {
      console.log(err)
    }
  });

  socket.on("disconnect", function (error) {
    console.log("\nMessage :", error);
  });
  
});
