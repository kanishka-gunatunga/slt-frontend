import { useState } from "react";
import axios from "axios";
import Preview from "./components/Preview";
import "./App.css";


function App() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [allData, setAllData] = useState([]);


  // const handleFileInput = (e) => {
  //   setFile(e.target.files[0]);
  //   setOutput(null);
  //   setError(null);
  // };

  const handleFileInput = (e) => {
    setFiles(Array.from(e.target.files));
    setOutput(null);
    setError(null);
  };


  const handleInput = async () => {
    setLoading(true);
    setError(null);

    if (!files) {
      setError("Please select a file first.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      // formData.append("file", file);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        "http://localhost:3005/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // console.log("response : ", response)
      let theData = response.data;
      // console.log("theData : ", theData)

      let cleaned = theData.replace(/```json|```/g, '').trim();

      
      // console.log("solutionBOQs : ", cleaned);
      let theDataAll = JSON.parse(cleaned);
      setAllData(cleaned);
      console.log(theDataAll);
      console.log("theDataAll : ", theDataAll.solutionBOQs)

      if (theData) {
        setOutput(JSON.parse(theData));
      }
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const fixedUsername = "admin";
    const fixedPassword = "password123";

    if (username === fixedUsername && password === fixedPassword) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError("Invalid username or password");
    }
  };

  
  return (
    <div className="main-container">
      {isAuthenticated ? (
        <>
          <div className="title">
            <h1>SLT PDF Generator</h1>
          </div>
          <div className="input-field">
            <label htmlFor="file-input" className="file-label">
              Choose File
              {/* <input
                id="file-input"
                className="file-input"
                onChange={handleFileInput}
                type="file"
                accept=".xlsx, .xls"
              /> */}
              <input
              id="file-input"
                type="file"
                accept=".xls,.xlsx"
                multiple
                onChange={handleFileInput}
              />

            </label>
          </div>
          <button onClick={handleInput} disabled={loading}>
            {loading ? "Loading..." : "Generate Data"}
          </button>
          {error && <p className="error">{error}</p>}
          <section className="preview">
            {output ? (
              <Preview initialData={allData} setOutput={setAllData} />
            ) : (
              <p className="content">
                No data available. Please upload a file.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div className="input-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      )}
      <p>{allData}</p>
    </div>
  );
}

export default App;
