import {useSignal} from "essor"
function App() {
  const signal = useSignal("hello ")
  const props={a:'b'}
  const onClick = () => {
    signal.value = ' world'
  }
  return (
    <div class="red" props={props} onClick={onClick}>
      <p {...props}>{signal.value} </p>
    </div>
  )
}
