/* возвращает список "Не выполнено" или "Выполнено" уведомлений */

if exists(select 1 from sys.procedures as a where a.name = 'GET_UVEDOML_ISP_OR_NOT_ISP') drop procedure dbo.GET_UVEDOML_ISP_OR_NOT_ISP;

GO

create procedure [dbo].[GET_UVEDOML_ISP_OR_NOT_ISP]
  @m_org_id int,
  @page int,
  @rows_per_page int,
  @isp int, -- 0 - вернёт "Не выполнено", 1 - "Выполнено"
  -- 1 - если не надо возвращать данные, а нужно только количество
  @return_only_cnt int
as	 
begin

  set datefirst 1;
  set nocount on;
  set ansi_warnings off;

  -- сегодня
  declare @getDate smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

  -- количество уведомлений, которые не были исполнены,
  -- с начала года по сегодня
	declare @cnt int
	select
    @cnt = count(*)
  from
    dbo.O_UVEDOML as u
	where
    u.M_ORG_ID = @m_org_id
		and u.ISP = @isp
		and u.D_SOB < @getDate
		and year(u.D_SOB) = year(@getDate)
  ;

  -- если надо вернуть только количество, без данных
  if (@return_only_cnt = 1) begin
    select @cnt COUNT_ALL;
    return;
  end;

  -- сами уведомления, которые не были исполнены,
  -- с начала года по сегодня,
  -- в разбитии по страницам
	select
     u.[ID] as Uvedoml_ID
    ,u.[M_VID_SOB_ID]
    ,isnull(u.[FIO], isnull(a.SURNAME,'') + ' ' + isnull(a.[NAME],'') + ' ' + isnull(a.SECNAME,'')) FIO
    ,u.[PHONE] as Phone
    ,u.[D_SOB] as [Date]
    ,cast(1 as bit) as IsShown
    ,u.[USERID] as UserID
    ,su.SURNAME + ' ' + su.[NAME] + ' ' + su.SECNAME  as UserName
    ,case
	    when u.[M_VID_SOB_ID] = 1 
	    then cast(1 as bit) 
	    else cast(0 as bit) 
    end as IsCall
    ,cast(0 as bit) as IsEmpty
    ,cast(0 as bit) as IsPerform
    ,u.[COMMENT] as Comment
    ,u.[O_ANK_ID] as ANK_ID
    ,@cnt as COUNT_ALL
    ,u.GR GR
    ,u.O_SKLAD_RAS_ID O_SKLAD_RAS_ID
	from
    dbo.O_UVEDOML as u
		join dbo.S_USER as su on su.ID = u.USERID
		left join dbo.O_ANK a on u.O_ANK_ID = a.ID
	where
        u.M_ORG_ID = @m_org_id
		and u.ISP = @isp
		and u.D_SOB < @getDate
		and year(u.D_SOB) = year(@getDate)
	order by
    u.ID
	offset
	  (@page - 1) * @rows_per_page rows
	fetch next
	  @rows_per_page rows only
  ;

end; -- proc

go

exec [dbo].[GET_UVEDOML_ISP_OR_NOT_ISP]
  @m_org_id = 2,
  @page = 1,
  @rows_per_page = 10,
  @isp = 1,
  @return_only_cnt = 1
;
