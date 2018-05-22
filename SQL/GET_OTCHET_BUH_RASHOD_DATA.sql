if exists(select 1 from sys.procedures as a where a.name = 'GET_OTCHET_BUH_RASHOD_DATA') drop procedure dbo.GET_OTCHET_BUH_RASHOD_DATA;

GO

create procedure [dbo].[GET_OTCHET_BUH_RASHOD_DATA]
	@m_org_id int = null,
	@date0 smalldatetime = null,
	@date1 smalldatetime = null as
begin
	select id,
				 d_schet,
				 isnull(summa_rash,0) summa,
 				 isnull((select max(isnull(u.surname,'') + ' ' + isnull(u.name + ' ','') + isnull(u.secname,''))
									 from s_user u
									where u.id = d.s_user_id),'') kto
	  from o_ras_dok d
	 where m_org_id = @m_org_id
		 and cast(d_schet as date) between cast(@date0 as date) and cast(@date1 as date);
end;