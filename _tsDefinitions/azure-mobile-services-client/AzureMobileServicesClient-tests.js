var client = new WindowsAzure.MobileServiceClient("your-azure-mobile-application-URL", "your-azure-application-KEY");
console.log("Azure application URL: " + client.applicationUrl);
console.log("Azure application KEY: " + client.applicationKey.replace(/./gi, '*'));
if (client.currentUser === null) {
    client.login("facebook")
        .then(function (u) { return alert(u.level); })
        .done(function () { return alert("USER: " + client.currentUser.userId); }, function (e) { return alert("ERROR: " + e); });
}
else {
    client.logout();
}
var data;
var tableTodoItems = client.getTable('todoitem');
tableTodoItems.read()
    .then(function (retList) {
    data = retList;
    return retList.length;
})
    .done(function (n) {
    return alert(n + " items downloaded");
}, function (e) { return alert("ERROR: " + e); });
function handlerInsUpd(e, i) { if (!e)
    data.push(i); }
;
function handlerDelErr(e) { if (e)
    alert("ERROR: " + e); }
tableTodoItems.insert({ text: 'hello world!', complete: false }, { timestamp: new Date() }, handlerInsUpd);
var todo = data.pop();
todo.complete = !todo.complete;
tableTodoItems.update(todo, null, handlerInsUpd);
tableTodoItems.del({ id: data[0].id }, null).done(null, handlerDelErr);
var query = tableTodoItems.select('text', 'id')
    .where({ complete: false })
    .orderBy('text');
query.read().done(printOut);
var minlength = 15;
query.where(function (len) { return this.text != null && this.text.length > len; }, minlength)
    .orderByDescending('id').skip(2).take(3)
    .select(function () { return { abc: this.text + '|' + this.id }; })
    .read().done(printOut);
function printOut(ret) {
    if (!ret)
        console.log("NO DATA FOUND!");
    else
        for (var i = 0; i < ret.length; i++) {
            console.log(JSON.stringify(ret[i]));
        }
}
