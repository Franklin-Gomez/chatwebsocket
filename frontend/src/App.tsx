import { io } from 'socket.io-client';
import { useEffect, useState , useRef } from 'react';

type Msg = {
  id: number;
  text: string;
  usuario : string;
};

// para que no se cree un nuevo socket cada vez que se renderiza el componente, lo creamos fuera del componente o lo podemos usar useMemo o useRef para que no se cree un nuevo socket cada vez que se renderiza el componente
const socket = io("http://localhost:3000");  

function App() {

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
    
  //   const messageInput = document.getElementById("message") as HTMLInputElement;
  //   const message = messageInput.value;

  //   const messages = document.getElementById("messages") as HTMLDListElement;

  //   socket.on("message", (message: string) => {
  //     const item = `<li>${message}</li>`;
  //     messages.insertAdjacentHTML("beforeend", item);
  //     messages.className = "text-white text-lg list-disc list-inside";
  //   });
    
  //   if(message.trim() === "") return; // si el mensaje esta vacio no hacemos nada
    
  //   socket.emit("message", message);
  //   messageInput.value = "";
    
  // };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [text, setText] = useState("");

  const listRef = useRef<HTMLUListElement>(null)

  // supongamos que ya tenemos el usuario en localstorage y lo obtenemos asi de forma random con una
  // api publica
  const getUsername = async () => {
    const user = localStorage.getItem("user");

    if( user ) {
      setUsername(user);
      return;
    }

    try { 

      const res = await fetch("https://randomuser.me/api/");
      const data = await res.json();
      const randomUsername : string  = data.results[0].login.username;  
  
      localStorage.setItem("user", randomUsername);
      setUsername(randomUsername);
    
    } catch (error) {
      console.error("Error fetching random username:", error);

      // respaldo si la API falla
      const fallback = `Usuario${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("user", fallback);
      setUsername(fallback);

    }

  }

  useEffect(() => {

    const list = listRef.current;
    if(!list) return;
    list.scrollTo({ top : list.scrollHeight , behavior : "smooth" })

  }, [messages]);

  useEffect(() => {

    getUsername();

    const onMessage = (message: Msg) => setMessages((prev) => [...prev, message] );
    const onHistory = (history: Msg[]) => setMessages(history);

    socket.on("history", onHistory);
    socket.on("message", onMessage);

    return () => {
      socket.off("message", onMessage); // evita listeners duplicados
      socket.off("history", onHistory);
    };

  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim() === "") return;

    socket.emit("message", { text , usuario : username });
    setText("");
  };


  return (
    <div className="bg-black h-lvh p-12">
      <section className="container mx-auto h-full flex flex-col items-center justify-center gap-4 ">

          <ul 
            id="messages" 
            className=" w-full max-w-md h-1/2 text-white text-lg overflow-y-scroll scroll-smooth"
            ref={ listRef }  
          >

            {messages.map((m) => (

              <div key={ m.id } className='flex odd:bg-gray-800 even:bg-gray-1000'>
                <li className='font-bold'>{m.usuario} : </li>  
                <li className=' ml-2 font-extralight'>{m.text}</li>
              </div>

            ))}

          </ul>

          <form id="form" className="flex flex-col gap-4 justify-center items-center w-full max-w-md" onSubmit={handleSubmit}>
            
            <input 
              value={text}
              onChange={(e) => setText(e.target.value)} 
              type="text" 
              name="message" 
              id="message" 
              placeholder="Type your message..." 
              className="border border-gray-300 rounded-md p-2 text-white bg-black w-full max-w-md" 
              autoComplete="off" 
            />
      
            <button 
              type="submit" 
              className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
              >Enviar</button>
            
            </form>
      </section >
    </div>
  )
}

export default App
