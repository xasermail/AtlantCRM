/* получить комментарии для группового уведомления */

if exists(select 1 from sys.procedures as a where a.name = 'GET_O_UVEDOML_GR_COMMENT_VIEW_MODEL') drop procedure dbo.GET_O_UVEDOML_GR_COMMENT_VIEW_MODEL;

GO

create procedure [dbo].[GET_O_UVEDOML_GR_COMMENT_VIEW_MODEL]
  @gr int
as begin

select
  c.*,
  isnull(au.UserName, 'неизв.') USERID_NAME
from
  dbo.O_UVEDOML_GR_COMMENT c
  left join dbo.S_USER u on u.ID = c.USERID
  left join dbo.AspNetUsers au on au.Id = u.AspNetUsersId
where
  c.O_UVEDOML_GR = @gr
order by
  c.ID desc
;

end; -- proc

go

exec [dbo].[GET_O_UVEDOML_GR_COMMENT_VIEW_MODEL] @gr = 12;