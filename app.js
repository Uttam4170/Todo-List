
const express=require("express");
const bodyParser=require("body-parser");
const request=require("request");
const https=require("https");
const mongoose=require("mongoose"); // for using mongoose module.
const app=express();
app.set('view engine','ejs'); // Set EJS as templating engine which search inside the views named directory 
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");
var options = { weekday: "long", day: "numeric", year: "numeric" , 
  month: "numeric" };
const itemsSchema={ // Making Schema of items
    name:String
};
const Item=mongoose.model("Item",itemsSchema); // Making Model if Items
const item1=new Item({ // creating collections data.
    name:"Welcome To your TODO list "
})

const item2=new Item({ // creating collections data.
    name:"Hit + to add items in your list "
})

const item3=new Item({ // creating collections data.
    name:"<-- Hit This To delete Item. "
})
const defaultItems=[item1,item2,item3]; 
const listSchema={ // Making Schema of lists
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
async function getItems(){  // Function to find elements and then return them as the array .
                                
    const Items = await Item.find({});
    return Items;
  }
app.get("/",function(req,res){
  var today=new Date(); // it returns the current day;
  var current=today.getDay(); // it gives the current day if 0= sunday to 6=saturday
  var dayname=daysOfWeek[current];
  var dayname=today.toLocaleDateString("en-US",options);
   
  getItems().then(function(FoundItems){ // calling the async function getItems 
    if(FoundItems.length===0){ // due to the if condition when length =0 i.e first time only it will insert the element
        Item.insertMany(defaultItems).then(function(err){ // THIS IS TO INSERT THE ITEMS INT DB
            // ONCE WE INSERTED THEN WE HAVE TO COMMENT OUT 
            //BCZ IT WILL SAVE AGAIN IF WE DON'T
    if(err){                                        
    console.log(err);      
}else{
console.log("Items Stored Successfully");
}
}) 
res.redirect("/");
    }else{
    res.render("list", {name: "Today", item:FoundItems});  // this say to render the file list.ejs and change name by dayname in list.ejs file ;
    // we can also add multiple names in res.render which template or render the items;
    }
  });

});
 

app.post("/",function(req,res) {  // this will run when you hit submit (+) sign button::
    let str=req.body.newItem; //getting the name of the element from body:::::::::
    let listname=req.body.button;
       const item4=new Item({  // Creating the new collection for the adding new item.
        name:str
});

if(listname==="Today"){
    item4.save();
    res.redirect("/");
}else{
    List.findOne({name:listname}).then(function(fountdata){
         fountdata.items.push(item4);
         fountdata.save();
         res.redirect("/"+listname);
    })
}
        // saving that item to the todolistDB      
        // redirect to home route i.e => app.get() that will render dayName and items 
});
app.post("/delete",function(req,res){
 const idele=req.body.checkbox; // It gives ID of the element which is:: 
 
 Item.findByIdAndDelete(idele).then(function(err){ // it finds the collection and delete it by the id.
    if(err){
    console.log(err);
    }
    res.redirect("/"); // After Deleting it redirect to the home page .
 })
 
});
app.get("/:customListName",function(req,res){
 const customname= req.params.customListName;
 const lists=new List({
    name:customname,
    items:defaultItems 
});

lists.save();
 List.findOne({name:customname}).then(function(foundList){
    res.render("list", {name:customname, item:foundList.items});
 })
 


});
app.listen(3000,function(){     
    console.log("server 3000 is running");
})