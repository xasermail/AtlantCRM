if exists(select 1 from sys.procedures as a where a.name = 'GET_SKLAD_GOST_DATA') drop procedure dbo.GET_SKLAD_GOST_DATA;

GO

create procedure [dbo].[GET_SKLAD_GOST_DATA]
	@m_org_id int = null,
	@date0 smalldatetime = null,
	@date1 smalldatetime = null as
begin
select s.D_REG,
			 isnull(a.surname + ' ','') + isnull(a.name + ' ',' ') + isnull(a.secname,'') FIO,
			 isnull(a.phone_mobile, a.phone_home) PHONE,
			 m.ADRES [ADDRESS],
			 (select max(rp.D_DEISTV)
					from (
						select r.O_ANK_ID, max(pr.ID) O_SKLAD_RAS_PRODUCT_ID
							from dbo.O_SKLAD_RAS r
							join dbo.O_SKLAD_RAS_PRODUCT pr on r.ID = pr.O_SKLAD_RAS_ID and pr.M_ORG_ID = r.M_ORG_ID
							join dbo.M_PRODUCT t on pr.M_PRODUCT_ID = t.ID and t.IS_ABON = 1
						 where r.O_ANK_ID is not null and r.M_ORG_ID = a.M_ORG_ID
						 group by r.O_ANK_ID) p
					left join dbo.O_SKLAD_RAS_PRODUCT rp on rp.ID = p.O_SKLAD_RAS_PRODUCT_ID and rp.M_ORG_ID = a.M_ORG_ID
					join dbo.M_PRODUCT t on rp.M_PRODUCT_ID = t.ID and t.IS_ABON = 1) D_DEISTV
	from dbo.O_SEANS s
	join dbo.O_ANK a on a.ID = s.O_ANK_ID and s.IS_GOST = 1
	left join dbo.M_ORG m on a.M_ORG_ID = m.ID
 where s.M_ORG_ID = @m_org_id
	 and cast(s.D_REG as date) between cast(@date0 as date) and cast(@date1 as date);
end;

go

set dateformat dmy;
exec [dbo].[GET_SKLAD_GOST_DATA]
	@m_org_id = 2,
	@date0 = '20.01.2018',
	@date1 = '25.01.2018'
;


