CREATE OR REPLACE VIEW vw_musicas_mais_adicionadas AS
SELECT
    m.cd_musica,
    m.nome_musica,
    COUNT(pm.cd_musica) AS total_adicoes
FROM playlist_musica pm
         JOIN musica m ON m.cd_musica = pm.cd_musica
GROUP BY m.cd_musica, m.nome_musica
ORDER BY total_adicoes DESC;


CREATE OR REPLACE VIEW vw_musicas_completo AS
SELECT
    m.cd_musica,
    m.nome_musica,
    a.nm_album,
    ar.nm_artista
FROM musica m
         LEFT JOIN album a ON m.cd_album = a.cd_album
         LEFT JOIN artista ar ON m.cd_artista = ar.cd_artista;

/* //////////////////////////////////////////////////////////////////////////////
*/


CREATE OR REPLACE FUNCTION fn_musicas_por_genero(p_genero TEXT)
    RETURNS TABLE (
                      cd_musica INT,
                      nome_musica TEXT,
                      genero TEXT,
                      cd_artista INT,
                      cd_album INT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT cd_musica, nome_musica, genero, cd_artista, cd_album
        FROM musica
        WHERE genero = p_genero;
END;
$$ LANGUAGE plpgsql;

CREATE VIEW vw_musicas_sem_album AS
SELECT nome_musica FROM musica
WHERE cd_album = 0;

CREATE VIEW vw_top5_artistas AS
SELECT ar.cd_artista, ar.nm_artista, COUNT(m.cd_musica) AS total_musicas
FROM artista ar
         JOIN musica m ON ar.cd_artista = m.cd_artista
GROUP BY ar.cd_artista, ar.nm_artista
ORDER BY total_musicas DESC
LIMIT 5;
