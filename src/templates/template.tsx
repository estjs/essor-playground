function App() {
  const $value = 'hello world';
  return (
    <div>
      <p>{$value}</p>
      <input type="text" bind:value={$value} />
    </div>
  );
}
