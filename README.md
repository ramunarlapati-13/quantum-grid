# Quantum Grid

**Quantum Grid** is a Real-time Grid Simulation Dashboard designed to visualize electrical grid metrics such as system frequency, grid voltage, total load, and total generation. It is built to receive real-time updates from MATLAB or any backend simulation engine via a REST API, and broadcast those updates to connected web clients using WebSockets.

## Features

- **Real-Time Data Visualization**: Live updates of frequency, voltage, and load vs. generation using `Chart.js`.
- **WebSocket Integration**: Instantaneous data broadcasting to all connected clients using `Socket.io`.
- **Fallback Polling Mechanism**: Ensures the dashboard continues to update even in serverless environments (like Vercel) where WebSockets might disconnect.
- **REST API Endpoint**: Simple `/api/update` endpoint to accept JSON payloads from simulation tools like MATLAB.
- **Modern, Responsive UI**: A premium, dark-mode focused aesthetic with glassmorphism effects and smooth animations.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Chart.js
- **Backend**: Node.js, Express
- **Real-Time Communication**: Socket.io
- **Deployment**: Configured for Vercel Serverless Functions

## Installation & Setup

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd quantum-grid
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run start
   # Or for Vercel CLI development:
   npm run dev
   ```

4. **Access the Dashboard**:
   Open `http://localhost:3000` in your web browser.

## Simulation Process

The simulation workflow connects a backend computational engine (like MATLAB or Simulink) to the frontend dashboard:

1. **Simulation Execution**: The backend engine runs the power grid simulation, calculating parameters like frequency, voltage, active load, and generation.
2. **Data Transmission**: At each simulation step (or at defined intervals), the engine constructs a JSON payload containing the latest metrics and sends it via an HTTP `POST` request to the `/api/update` endpoint.
   
   **Example MATLAB Implementation**:
   ```matlab
   % Define the API endpoint URL
   apiUrl = 'http://localhost:3000/api/update';

   % Create a structure with the current grid state
   gridState = struct(...
       'frequency', 50.02, ...
       'voltage', 230.1, ...
       'totalLoad', 1050, ...
       'totalGen', 1055, ...
       'simHour', 12.5 ...
   );

   % Set web options to send JSON
   options = weboptions('MediaType', 'application/json', 'Timeout', 5);

   % Send the POST request
   try
       response = webwrite(apiUrl, gridState, options);
       disp('Grid state updated successfully');
   catch ME
       disp(['Failed to send update: ', ME.message]);
   end
   ```

3. **Data Broadcast**: The Node.js server receives the data, updates the internal state, and immediately broadcasts the new metrics to all connected web clients via WebSockets (`Socket.io`).
4. **Real-time Visualization**: The web dashboard receives the broadcast, updates the progress bars and values, and appends the new data points to the historical charts (`Chart.js`). If WebSockets are unavailable, the dashboard falls back to polling the `/api/state` endpoint every 2 seconds.

## API Documentation

### Update Grid State
- **Endpoint**: `POST /api/update`
- **Payload**:
  ```json
  {
    "frequency": 50.0,
    "voltage": 230.0,
    "totalLoad": 1000,
    "totalGen": 1005,
    "simHour": 12.5
  }
  ```
  *(Sends the updated grid metrics to the dashboard in real-time.)*

### Get Current Grid State
- **Endpoint**: `GET /api/state`
- *(Returns the latest known grid state. Used primarily as a polling fallback.)*

## License

MATLAB Real-time Simulation Interface &copy; 2026
