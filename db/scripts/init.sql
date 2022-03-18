DROP TABLE IF EXISTS Games;
DROP TABLE IF EXISTS Players;

create table Players (
  id_player INT GENERATED ALWAYS AS IDENTITY,
  name varchar(255) not null,
  PRIMARY KEY("id_player")
);

create table Games (
  id INT GENERATED ALWAYS AS IDENTITY,
  description text,
  player1 INT NOT NULL,
  player2 INT NOT NULL,
  id_winner INT default NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY(id),
  CONSTRAINT fk_player1
  	FOREIGN KEY(player1)
  	REFERENCES Players(id_player),
  CONSTRAINT fk_player2
  	FOREIGN KEY(player2)
  	REFERENCES Players(id_player),  
  CONSTRAINT fk_winner
      FOREIGN KEY(id_winner) 
	  REFERENCES Players(id_player)
);

CREATE OR REPLACE FUNCTION delete_players() RETURNS TRIGGER AS $$
    BEGIN
        DELETE FROM Players WHERE id_player IN (old.player1, old.player2);
        RETURN OLD;
    END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER trigger_delete_players AFTER DELETE on Games 
FOR EACH ROW
EXECUTE PROCEDURE delete_players();
