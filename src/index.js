import React from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import ReactDOM from 'react-dom';
import './index.css';


const API_KEY = process.env.REACT_APP_API_KEY;

class App extends React.Component {
  state = {
    restaurants: [],
    isLoading: true,
    errors: null,
    center: [38.0293, -78.4767],
    zoom: 14
  };

  getRestaurants() {
    axios
      .get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=38.0293,-78.4767&radius=10000&type=restaurant&key=" + `${API_KEY}`)
      .then(response =>
        response.data.results.map(restaurant => ({
          name: `${restaurant.name}`,
          place_id: `${restaurant.place_id}`,
          rating: `${restaurant.rating}`,
          price_level: `${restaurant.price_level}` === "undefined" ? "Not Available" : `${restaurant.price_level}`,
          icon: `${restaurant.icon}`,
          photo_ref: `${restaurant.photos[0].photo_reference}`,
          photo_url: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photoreference=" + `${restaurant.photos[0].photo_reference}` + "&key=" + `${API_KEY}`,
          latitude: `${restaurant.geometry.location.lat}`,
          longitude: `${restaurant.geometry.location.lng}`,
          address: `${restaurant.vicinity}`
        }))
      )
      .then(restaurants => {
        this.setState({
          restaurants,
          isLoading: false
        });
      })
      .catch(error => this.setState({ error, isLoading: false }));
  }

  componentDidMount() {
    this.getRestaurants();
  }

  handleClick(lat, lng) {
    this.setState({ zoom: 18, center: [lat, lng] });
  }

  render() {
    const { isLoading, restaurants } = this.state;
    return (
      <React.Fragment>
        <h2 className="title">Charlottesville Restaurants</h2>
        <Map center={this.state.center} zoom={this.state.zoom}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {restaurants.map(restaurant => (
            <Marker
              key={restaurant.place_id}
              position={[restaurant.latitude, restaurant.longitude]}>
              <Popup>
                <b>{restaurant.name}</b> <br />
                {restaurant.address}
              </Popup>
            </Marker>
          ))}
        </Map>
        <div className="container">
          {!isLoading ? (
            restaurants.map(restaurant => {
              const { place_id, name, rating, price_level, photo_url, latitude, longitude } = restaurant;
              return (
                <div key={place_id}>
                  <p className="heading">{name}</p>
                  <div className="info">
                    <p >Rating: {rating}</p>
                    <p >Price Level: {price_level}</p>
                  </div>
                  <div>
                    <img className="photo" src={photo_url}/>
                  </div>
                  <Button variant="outlined" style={{ padding:"5px", margin: "10px"}} 
                    onClick={() => {this.handleClick(latitude, longitude);}}>
                    View on map
                  </Button>
                  <hr />
                </div>
              );
            })
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));