INSERT INTO album (cd_album, nm_album) VALUES (0, 'Álbum desconhecido')
ON CONFLICT (cd_album) DO NOTHING;

CREATE OR REPLACE FUNCTION tgAlbumExcluido()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE musica
    SET cd_album = 0  
    WHERE cd_album = OLD.cd_album;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_album
    BEFORE DELETE ON album
    FOR EACH ROW
EXECUTE FUNCTION tgAlbumExcluido();


INSERT INTO artista (cd_artista, nm_artista) VALUES (0, 'Artista desconhecido')
ON CONFLICT (cd_artista) DO NOTHING;

CREATE OR REPLACE FUNCTION tgArtistaExcluido()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE musica
    SET cd_artista = 0  
    WHERE cd_artista = OLD.cd_artista;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_artista
    BEFORE DELETE ON artista
    FOR EACH ROW
EXECUTE FUNCTION tgArtistaExcluido();



CREATE OR REPLACE FUNCTION tgUsuarioExcluido() RETURNS TRIGGER AS $$
BEGIN

    DELETE FROM playlist_musica
    WHERE cd_playlist IN (
        SELECT cd_playlist FROM playlist WHERE cd_usuario = OLD.cd_usuario
    );
    DELETE FROM playlist WHERE cd_usuario = OLD.cd_usuario;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tgUsuarioExcluido
    BEFORE DELETE ON usuario
    FOR EACH ROW
EXECUTE FUNCTION tgUsuarioExcluido();

INSERT INTO playlist (cd_usuario) VALUES (NEW.cd_usuario);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tg_criarPlaylistNovoUser() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO playlist (cd_usuario) VALUES (NEW.cd_usuario);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER tg_criarPlaylistNovoUser
AFTER INSERT ON usuario
FOR EACH ROW
EXECUTE FUNCTION tg_criarPlaylistNovoUser();
