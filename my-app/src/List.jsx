function List(props){
  const type = props.category;
  const listItems = props.items;
  

  const list = listItems.map((item) => (
    <li key={item.name}>{item.name} <b>{item.calories}</b></li>
  ));
    return (
        <div className="list">
          <h3>{type}</h3>
          <ol>{list}</ol>
        </div>    
    );
}
export default List;
