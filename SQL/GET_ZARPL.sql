/* получить страницу для режима Зарплата */

if exists(select 1 from sys.procedures as a where a.name = 'GET_ZARPL') drop procedure dbo.GET_ZARPL;

GO

create procedure [dbo].[GET_ZARPL]
  @m_org_id int,
  @id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;


if (@id = 0) begin

  select
    0 ID,
    isnull(u.SURNAME + ' ', '') + isnull(left(u.NAME, 1) + '.', '') + isnull(left(u.SECNAME, 1) + '.', '') fio,
    u.ID S_USER_ID,
    null O_ZARPL_ID,
    0 DNI,
    0 CHAS,
    0.0 S_CH,
    0.0 SUMMA,
    0.0 VALOV_DOHOD,
    0.0 PROTS,
    0.0 BONUS,
    0.0 SHTRAF,
    0.0 ZARPL
  from
    dbo.S_USER u
  where
    u.M_ORG_ID = @m_org_id
  ;

end else begin

  select
    f.*,
    isnull(u.SURNAME + ' ', '') + isnull(left(u.NAME, 1) + '.', '') + isnull(left(u.SECNAME, 1) + '.', '') fio,
    u.ID S_USER_ID
  from
    dbo.O_ZARPL z
    join dbo.O_ZARPL_FIO f on f.O_ZARPL_ID = z.ID
    left join dbo.S_USER u on f.S_USER_ID = u.ID
  where
    z.ID = @id
  ;

end;


end;

go


set dateformat dmy;
exec dbo.GET_ZARPL @m_org_id = 2, @id = 23;