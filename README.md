# Budget Planner Application (MERN Stack)

To run this project locally, follow these steps:

1. **Clone the repository**  
`git clone https://github.com/<your-username>/budget-planner-app.git`  
`cd budget-planner-app`

2. **Install dependencies**  
Install backend dependencies:  
`cd backend && npm install`  
Install frontend dependencies:  
`cd ../frontend && npm install`

3. **Set up MongoDB**  
- Install [MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/)  
- Start MongoDB service:  
  - Linux: `sudo systemctl start mongod`  
  - macOS: `brew services start mongodb-community`  
  - Windows: Start via Windows Services (Search > Services > MongoDB)  
- Create database:  
  ```bash
  mongo
  > use budget-planner

4. **Start the application**
In separate terminals:

- Backend:
  ```bash
  > cd backend
  > node server.js`
  ```
- Frontend:
  ```bash
  > cd frontend
  > npm start
  ```
