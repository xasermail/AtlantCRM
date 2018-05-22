if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_OPROS') drop procedure dbo.GET_REPORT_OPROS;

GO

create procedure [dbo].[GET_REPORT_OPROS]
	@date0 smalldatetime,
	@date1 smalldatetime,
	@m_org_id int as
begin
	select 'Всего опрошено: ' + cast(
				 (select count(distinct o_ank_id) from dbo.O_VOPROS a where a.M_ORG_ID = @m_org_id and cast(a.d_start as date) between cast(@date0 as date) and cast(@date1 as date))
				 as varchar(50)) NAME,
				 0 M_VOPROS_TAB_ID,
				 'Да' DA,
				 'Нет' NET,
				 'Пусто' PUSTO
   union all
	select o.NAME,
				 v.M_VOPROS_TAB_ID,
				 cast(sum(case when v.M_YES_NO_ID = 1 then 1 else 0 end) as varchar(50)) DA,
				 cast(sum(case when v.M_YES_NO_ID = 2 then 1 else 0 end) as varchar(50)) NET,
				 cast(sum(case when v.COMMENT is not null then 1 else 0 end) as varchar(50)) PUSTO
		from dbo.O_VOPROS v
		join dbo.M_VOPROS o on v.M_VOPROS_ID = o.ID
	 where v.M_ORG_ID = @m_org_id
		 and cast(v.d_start as date) between cast(@date0 as date) and cast(@date1 as date) 
	 group by o.NAME, v.M_VOPROS_TAB_ID;
end;