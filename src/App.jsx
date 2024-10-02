import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css'; // Add CSS styling for the board

const API_URL = 'https://api.quicksell.co/v1/internal/frontend-assignment';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status'); // Default group by Status
  const [sortOption, setSortOption] = useState('priority'); // Default sort by Priority

  // Fetch tickets data from the API
  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setTickets(response.data.tickets)
        setUsers(response.data.users)

      }).catch((error) => console.error('Error fetching tickets:', error));
  }, []);

  // Handle grouping and sorting of tickets
  const groupTickets = (tickets) => {
    let groupedTickets = {
      'Backlog' : [],
      'Todo': [],
      'In progress' : [],
      'Done': []
    };

    // Group tickets based on the selected grouping option
    switch (grouping) {
      case 'user':
        groupedTickets = tickets.reduce((acc, ticket) => {
          const user = ticket.user || 'Unassigned';
          if (!acc[user]) acc[user] = [];
          acc[user].push(ticket);
          return acc;
        }, {});
        break;
      case 'priority':
        groupedTickets = tickets.reduce((acc, ticket) => {
          const priority = ticket.priority || 'Low';
          if (!acc[priority]) acc[priority] = [];
          acc[priority].push(ticket);
          return acc;
        }, {});
        break;
      case 'status':
      default:
        groupedTickets = tickets.reduce((acc, ticket) => {
          const status = ticket.status || 'Unknown';
          if (!acc[status]) acc[status] = [];
          acc[status].push(ticket);
          return acc;
        }, {});
        break;
    }

    // Sort tickets in each group based on the selected sort option
    for (const key in groupedTickets) {
      groupedTickets[key].sort((a, b) => {
        if (sortOption === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortOption === 'priority') {
          return b.priority - a.priority; // Descending order for priority
        }
        return 0;
      });
    }

    return groupedTickets;
  };

  // Handle when grouping option changes
  const handleGroupingChange = (event) => {
    setGrouping(event.target.value);
  };

  // Handle when sorting option changes
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const groupedTickets = groupTickets(tickets);

  return (
    <div className="kanban-board">
      <div className="controls row">
      <label className='label_cust'>Display</label><br/>
        <label className='label_cust'>
          Grouping :
          <select value={grouping} onChange={handleGroupingChange}>
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <label className='label_cust'>
          Ordering :
          <select value={sortOption} onChange={handleSortChange}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
      <div className="kanban-board-cards row">
        <DragDropContext onDragEnd={() => {}}>
          {Object.entries(groupedTickets).map(([group, tickets]) => (
            <Droppable droppableId={group} key={group}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{group}</h3>
                  {tickets.map((ticket, index) => (
                    <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                      {(provided) => (
                        <div
                          className="kanban-ticket"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <h4>{ticket.title}</h4>
                          <p>Status: {ticket.status}</p>
                          <p>Priority: {ticket.priority}</p>
                          <p>Assigned to: {ticket.user || 'Unassigned'}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
