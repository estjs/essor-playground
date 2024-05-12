function App() {
  let $signal = "hello "
  const props={a:'b'}
  const onClick = () => {
    $signal = ' world'
  }
  return (
    <div class="red" props={props} onClick={onClick}>
      <p {...props}>{ $signal} </p>
    </div>
  )
}
